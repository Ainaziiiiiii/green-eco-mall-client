import { baseApi } from './baseApi';

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createQr: builder.mutation({
      query: () => ({
        url: '/api/payment/create-qr',
        method: 'POST',
      }),
    }),
    getPaymentStatus: builder.query({
      query: (id: string) => `/api/payment/status/${id}`,
    }),
    checkPayment: builder.mutation({
      query: (id: string) => ({
        url: `/api/payment/check/${id}`,
        method: 'POST',
      }),
    }),
  }),
});

export const { useCreateQrMutation, useGetPaymentStatusQuery, useCheckPaymentMutation } = paymentApi;
