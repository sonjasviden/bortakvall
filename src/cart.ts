import { Product, CartProduct } from './types'

export { cart, addToCart, createCartListeners, openCart, closeCart, getSavedCart, emptyCart, quantityChanged }

const BASE_URL = 'https://www.bortakvall.se'
const cart: CartProduct[] = []

const cartEl = document.getElementById('cart-list')!

const renderCart = () => {
	cartEl.innerHTML = cart.map(cartProduct =>
		`
			<li class="cart-products-list" data-id="${cartProduct.product.id}">
				<img src="${BASE_URL}${cartProduct.product.images.thumbnail}" class="cart-thumbnail" alt="">
				<div class="products-in-cart flex">
					<h3>${cartProduct.product.name}</h4>
					<span class="cart-price">${cartProduct.product.price} kr</span>
					<div class="counter">
						Antal: <input type="number" class="cart-quantity-input" value="${cartProduct.quantity}" data-id="${cartProduct.product.id}">
					</div>
				</div>
				<div class="prices">
					<button class="btn-remove" data-id="${cartProduct.product.id}">
						Ta bort
					</button>
					<div class="total-per-product">${cartProduct.quantity * cartProduct.product.price} kr</div>
				</div>
			</li>
		`
	).join('')

	const removeBtns = document.querySelectorAll<HTMLButtonElement>('.btn-remove')
	for (const button of Array.from(removeBtns)) {
		const productId = Number(button.dataset.id!)
		button.addEventListener('click', e => {
			const buttonClicked = e.target as HTMLButtonElement
			if (buttonClicked) {
				removeFromCart(productId)
				buttonClicked.parentElement?.parentElement?.remove()
			}
			updateCartTotal()
		})
	}

	const quantityInputs = document.querySelectorAll<HTMLInputElement>('.cart-quantity-input')
	for (const input of Array.from(quantityInputs)) {
		const product = getProductInCart(Number(input.dataset.id!))!.product
		input.addEventListener('change', (e: Event) => {
			quantityChanged(e, product)
		})
	}
	updateCartTotal()
}

const updateCartTotal = () => {
	let total = 0
	for (const child of Array.from(cartEl.children)) {
		const cartRow = child as HTMLLIElement
		const cartProduct = resolveCartProduct(Number(cartRow.dataset.id!))!
		const price = cartProduct.product.price
		const quantity = cartProduct.quantity
		const itemTotalEl = cartRow.querySelector<HTMLDivElement>('.total-per-product')!
		itemTotalEl.innerText = `${price * quantity} kr`
		total += (price * quantity)
	}
	document.querySelector<HTMLParagraphElement>('.cart-total-price')!.innerText = `Totalt: ${total} kr`
}

const quantityChanged = (e: Event, product: Product) => {
	const input = e.target as HTMLInputElement
	const val = Number(input.value)
	if (Number.isInteger(val)) {
		if (val > 0) {
			setProductQuantity(product, val)
			input.value = String(getMaxOrderQuantity(product, val))
		} else if (val === 0) {
			removeFromCart(product)
			input.parentElement?.parentElement?.parentElement?.remove()
		} else {
			setProductQuantity(product, 1)
			input.value = '1'
		}
	} else {
		setProductQuantity(product, 1)
		input.value = '1'
	}
	saveCart()
	updateCartTotal()
}

const addToCart = (product: Product) => {
	const cartProduct = getProductInCart(product.id)
	if (cartProduct) {
		cartProduct.quantity = getMaxOrderQuantity(cartProduct.product, cartProduct.quantity + 1)
	} else {
		cart.push({ quantity: 1, product: product } as CartProduct)
	}
	saveCart()
	renderCart()
}

const getProductInCart = (productId: number) => {
	return cart.find(cartProduct => cartProduct.product.id === productId)
}

const setProductQuantity = (product: Product | number, quantity: number) => {
	const cartProduct = resolveCartProduct(product)
	if (cartProduct) {
		cartProduct.quantity = getMaxOrderQuantity(cartProduct.product, quantity)
	} else {
		cart.push({ quantity, product } as CartProduct)
	}
	saveCart()
	renderCart()
}

const removeFromCart = (product: Product | number) => {
	const cartProduct = resolveCartProduct(product)
	if (cartProduct) {
		const index = cart.findIndex(p =>
			p.product.id === cartProduct.product.id
		)
		if (index > -1) cart.splice(index, 1)
	}
	saveCart()
}

const resolveCartProduct = (product: Product | number) => {
	return getProductInCart(
		typeof product === 'number'
			? product
			: product.id
	)
}

const getMaxOrderQuantity = (product: Product, quantity: number | null) => {
	return Math.min(Number(quantity), Number(product.stock_quantity))
}

const cartSlideOut = document.querySelector<HTMLDivElement>('#cart-slide-out')!

const createCartListeners = () => {
	const showCartBtn = document.querySelector<HTMLButtonElement>('#show-cart-button')!
	showCartBtn.addEventListener('click', () => {
		openCart()
	})

	const closeCartBtn = document.querySelector<HTMLButtonElement>('#close-cart-button')!
	closeCartBtn.addEventListener('click', () => {
		closeCart()
	})
}

const closeCart = () => {
	cartSlideOut.classList.remove('cart-open')
}

const openCart = () => {
	cartSlideOut.classList.add('cart-open')
}

const saveCart = () => {
	localStorage.setItem('cart', JSON.stringify(cart))
}

const getSavedCart = () => {
	const savedCart = localStorage.getItem('cart')
	if (savedCart) {
		cart.push(...(JSON.parse(savedCart) as CartProduct[]))
		renderCart()
	}
}

const emptyCart = () => {
	cart.splice(0, cart.length)
	saveCart()
	renderCart()
}