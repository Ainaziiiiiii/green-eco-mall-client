import { baseApi } from './baseApi';

export const withdrawalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWithdrawals: builder.query<any, { page?: number; limit?: number } | undefined>({
      query: ({ page = 0, limit = 20 } = {}) =>
        `/api/withdrawals?page=${page}&limit=${limit}`,
      providesTags: ['Withdrawals'],
    }),
    createWithdrawal: builder.mutation({
      query: (body) => ({
        url: '/api/withdrawals',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Withdrawals'],
    }),
  }),
});

export const { useGetWithdrawalsQuery, useCreateWithdrawalMutation } = withdrawalsApi;
