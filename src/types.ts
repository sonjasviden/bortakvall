export type ProductImages = {
	thumbnail: string,
	large: string
}

export type Product = {
	id: number,
	name: string,
	description: string,
	images: ProductImages,
	on_sale: boolean,
	price: number,
	stock_quantity: number | null,
	stock_status: string
}

export type CartProduct = {
	quantity: number,
	product: Product
}

export type User = {
	firstName: string,
	lastName: string,
	address: string,
	postcode: string,
	city: string,
	email: string,
	phone: string | null
}

export type OrderProduct = {
	product_id: number,
	qty: number,
	item_price: number,
	item_total: number
}

export type Order = {
	customer_first_name: string,
	customer_last_name: string,
	customer_address: string,
	customer_postcode: string,
	customer_city: string,
	customer_email: string,
	customer_phone: string | null,
	order_total: number,
	order_items: OrderProduct[]
}