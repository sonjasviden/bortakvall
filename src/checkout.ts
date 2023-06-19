import { CartProduct, User, Order, OrderProduct } from './types'
import { cart, emptyCart } from './cart'
import { BASE_URL, sendOrder } from './api'
export { createCheckoutListeners }

const createCheckoutListeners = () => {
	const checkoutModal = document.querySelector('#checkout-modal')!
	const checkoutBtn = document.querySelector('#checkoutBtn')!
	checkoutBtn.addEventListener('click', () => {
		prefillUserForm()
		renderCheckoutCart()
		checkoutModal.classList.remove('hide')
		document.querySelector('#products')!.classList.add('hide')
		document.querySelector('#cart-slide-out')!.classList.remove('cart-open')
		if (cart.length > 0) {
			document.querySelector<HTMLButtonElement>('#place-order-button')!.disabled = false
		}
	})

	const closeCheckoutBtn = document.querySelector('#close-checkout-button')!
	closeCheckoutBtn.addEventListener('click', () => {
		checkoutModal.classList.add('hide')
		document.querySelector('#products')!.classList.remove('hide')
		resetConfirmation()
	})

	const userForm = document.querySelector<HTMLFormElement>('#checkout-form')!
	userForm.addEventListener('submit', async e => {
		e.preventDefault()
		await placeOrder()
	})
}
const renderCheckoutCart = () => {
	const cartCheckout = document.getElementById('cart-checkout')!
	cartCheckout.innerHTML = cart.map(cartProduct =>
		`
			<li class="checkout-cart-item" data-id="${cartProduct.product.id}">
				<img src="${BASE_URL}${cartProduct.product.images.thumbnail}" class="cart-thumbnail-checkout" alt="">
				<div class="products-in-cart-checkout">
					<h3>${cartProduct.product.name}</h3>
					<div class="cart-price">Antal: ${cartProduct.quantity}</div>
					<div class="prices-checkout">
						Totalt: ${cartProduct.quantity * cartProduct.product.price} kr
					</div>
				</div>
			</li>
		`
	).join('')
	document.getElementById('order-total')!.innerHTML = `Totalt: ${cart.reduce((acc, cartProduct) => acc + cartProduct.product.price * cartProduct.quantity, 0)} kr`
}

const placeOrder = async () => {
	if (cart.length < 1) return
	if (!formIsValid()) return
	disableOrderButton()
	const user = createUser()
	const order = createOrder(cart, user)
	const response = await sendOrder(order)
	if (response.status === 'success') {
		console.log(response.data)
		emptyCart()
		saveUser(user)
		displayConfirmation(response.data.id)
	} else {
		displayError(response)
	}
}

const createUser = () => {
	const userForm = document.querySelector<HTMLFormElement>('#checkout-form')!
	return {
		firstName: userForm.fname.value,
		lastName: userForm.lname.value,
		address: userForm.address.value,
		postcode: userForm.postcode.value,
		city: userForm.city.value,
		email: userForm.email.value,
		phone: userForm.phone.value
	} as User
}

const createOrder = (cart: CartProduct[], user: User) => {
	const orderProducts = cart.map(cartProduct => ({
		product_id: cartProduct.product.id,
		qty: cartProduct.quantity,
		item_price: cartProduct.product.price,
		item_total: cartProduct.product.price * cartProduct.quantity
	} as OrderProduct))
	const orderTotal = orderProducts.reduce((acc, product) => acc + product.item_total, 0)
	return {
		customer_first_name: user.firstName,
		customer_last_name: user.lastName,
		customer_address: user.address,
		customer_postcode: user.postcode,
		customer_city: user.city,
		customer_email: user.email,
		customer_phone: user.phone,
		order_total: orderTotal,
		order_items: orderProducts
	} as Order
}

const saveUser = (user: User) => {
	localStorage.setItem('user', JSON.stringify(user))
}

const getSavedUser = () => {
	const savedUser = localStorage.getItem('user')
	if (savedUser) return JSON.parse(savedUser) as User
}

const prefillUserForm = () => {
	const user = getSavedUser()
	if (!user) return
	const userForm = document.querySelector<HTMLFormElement>('#checkout-form')!
	userForm.fname.value = user.firstName
	userForm.lname.value = user.lastName
	userForm.address.value = user.address
	userForm.postcode.value = user.postcode
	userForm.city.value = user.city
	userForm.email.value = user.email
	userForm.phone.value = user.phone
}

const formIsValid = () => {
	const userForm = document.querySelector<HTMLFormElement>('#checkout-form')!
	return (
		userForm.fname.value.length > 1
		&& userForm.lname.value.length > 1
		&& userForm.address.value.length > 1
		&& userForm.postcode.value.length > 1
		&& userForm.city.value.length > 1
		&& userForm.email.value.length > 4
		&& userForm.email.value.includes('@')
	)
}

const confirmationDiv = document.getElementById('order-confirmation')!

const displayConfirmation = (orderId: number) => {
	const user = getSavedUser()
	resetConfirmation()
	confirmationDiv.classList.add('successful-order')
	confirmationDiv.innerHTML = `Tack för din beställning, ${user?.firstName}! Ditt ordernummer är: ${orderId}`
}

const displayError = (data: any) => {
	resetConfirmation()
	confirmationDiv.classList.add('failed-order')
	confirmationDiv.innerHTML = `Ett fel uppstod vid beställning!`
	console.log(data)
}

const resetConfirmation = () => {
	confirmationDiv.classList.remove('successful-order', 'failed-order')
	confirmationDiv.innerHTML = ''
}

const disableOrderButton = () => {
	document.querySelector<HTMLButtonElement>('#place-order-button')!.disabled = true
}