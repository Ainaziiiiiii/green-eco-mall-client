import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const APP_BASE_URL = 'http://localhost:8080'

export const baseApi = createApi({
	reducerPath: 'baseApi',
	baseQuery: fetchBaseQuery({
		baseUrl: APP_BASE_URL,
		prepareHeaders: (headers) => {
			const token = localStorage.getItem('accessToken')
			if (token) {
				headers.set('authorization', `Bearer ${token}`)
			}
			return headers
		},
	}),
	tagTypes: ['User', 'Dashboard', 'Tree', 'Levels', 'Bonuses', 'Withdrawals', 'News'],
	endpoints: () => ({}),
})
