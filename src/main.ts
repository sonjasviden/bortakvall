import { Product } from './types'
import { BASE_URL, getProducts } from './api'
import { addToCart, createCartListeners, getSavedCart, openCart } from './cart'
import { createCheckoutListeners } from './checkout'
import './style.css'

const productListEl = document.getElementById('products')!

const products: Product[] = []
getProducts().then(res => {
	products.push(...res)
	renderProducts()
	showProductCount()
	getSavedCart()
}).catch(console.error)

const renderProducts = () => {
	productListEl.innerHTML = products.map(product =>
		`
			<li>
				<div class="product-card">
					<img class="product-thumbnail" src="${BASE_URL}${product.images.thumbnail}" data-id="${product.id}" alt="">
					<div class="product-name" data-id="${product.id}">${product.name}</div>
					<div class="product-price">${product.price} kr</div>
					<button
						class="add-to-cart-button"
						type="button"
						data-id="${product.id}"
						${product.stock_status === 'instock' ? '' : 'disabled'}
					>
						${product.stock_status === 'instock' ? 'Lägg i varukorg' : 'Finns ej i lager'}
					</button>
					<div class="stock-quantity">
						${product.stock_quantity === null ? 0 : product.stock_quantity} st i lager
					</div>
				</div>
			</li>
		`
	).join('')
}

const sortProductsBtn = document.querySelector('#sort-products-up')!
sortProductsBtn.addEventListener('click', () => {
	sortProductsbyName()
	renderProducts()
})

const sortProductsBtnDown = document.querySelector('#sort-products-down')!
sortProductsBtnDown.addEventListener('click', () => {
	sortProductsbyNameReverse()
	renderProducts()
})

const sortProductsbyName = () => {
	products.sort((a, b) => {
		if (a.name < b.name) return 1
		if (a.name > b.name) return -1
		return 0
	})
}

const sortProductsbyNameReverse = () => {
	products.sort((a, b) => {
		if (a.name > b.name) return 1
		if (a.name < b.name) return -1
		return 0
	})
}

const showProductCount = () => {
	const productCountEl = document.querySelector('#product-count')!
	const inStockCount = products.reduce((acc, product) => acc + Number(product.stock_status === 'instock'), 0)
	productCountEl.innerHTML = `Visar ${products.length} produkter varav ${inStockCount} är i lager`
}

const getProductById = (id: number) => {
	return products.find(product => product.id === id)
}

const elementIsAddToCartButton = (element: HTMLElement) => {
	return element.classList.contains('add-to-cart-button') && element.dataset.id
}

const elementIsProduct = (element: HTMLElement) => {
	return element.classList.contains('product-thumbnail') || element.classList.contains('product-name')
}

const modalBg = document.getElementById('modal-bg')!

modalBg.addEventListener('click', e => {
	const element = e.target as HTMLElement
	if (element.id === 'modal-bg') {
		toggleModal()
	}
})

const toggleModal = () => {
	const modalBgStyle = modalBg.style
	if (modalBgStyle.display === 'none' || !modalBgStyle.display) {
		modalBgStyle.display = 'block'
	} else if (modalBgStyle.display === 'block') {
		modalBgStyle.display = 'none'
	}
}

productListEl.addEventListener('click', e => {
	const element = e.target as HTMLElement
	const product = getProductById(Number(element.dataset.id))
	if (!product) return
	if (elementIsAddToCartButton(element)) {
		addToCart(product)
		openCart()
	} else if (elementIsProduct(element)) {
		const modal = document.querySelector<HTMLDivElement>('#modal')!
		modal.innerHTML = `
			<div class="detailed-product-card">
				<img class="product-large" src="${BASE_URL}${product.images.large}" data-id="${product.id}" alt="">
				<div class="product-description">
					<h2>${product.name}</h2>
					${product.price} kr
					<span class="stock-quantity-modal">
						(${product.stock_quantity === null ? 0 : product.stock_quantity} st i lager)
					</span>
					<h3>Beskrivning</h3>
					${product.description}
					<button
						class="add-to-cart-button"
						type="button"
						data-id="${product.id}"
						${product.stock_status === 'instock' ? '' : 'disabled'}
					>
						${product.stock_status === 'instock' ? 'Lägg i varukorg' : 'Finns ej i lager'}
					</button>
				</div>
			</div>
		`
		modal.querySelector<HTMLButtonElement>('.add-to-cart-button')!.addEventListener('click', () => {
			addToCart(product)
			openCart()
			toggleModal()
		})
		toggleModal()
	}
})

createCartListeners()

createCheckoutListeners()