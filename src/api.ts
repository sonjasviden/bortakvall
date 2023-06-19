import { Product, Order } from './types'

export { BASE_URL, getProducts, sendOrder }

const BASE_URL = 'https://www.bortakvall.se'
const API_URL = '/api'

const getProducts = async () => {
	const response = await fetch(`${BASE_URL}${API_URL}/products`)
	const json = await response.json()
	return json.data as Product[]
}

const sendOrder = async (order: Order) => {
	const response = await fetch(`${BASE_URL}${API_URL}/orders`, {
		method: 'POST',
		body: JSON.stringify(order),
		headers: {'Content-Type': 'application/json'}
	})
	return await response.json()
}