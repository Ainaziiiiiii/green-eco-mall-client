import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/api/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    sendOtp: builder.mutation({
      query: (phone: string) => ({
        url: '/api/auth/send-otp',
        method: 'POST',
        body: { phone },
      }),
    }),
    verifyOtp: builder.mutation({
      query: (data: { phone: string; code: string }) => ({
        url: '/api/auth/verify-otp',
        method: 'POST',
        body: data,
      }),
    }),
    refresh: builder.mutation({
      query: (refreshToken: string) => ({
        url: '/api/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
    }),
    getMe: builder.query({
      query: () => '/api/user/me',
      providesTags: ['User'],
    }),
    getInviter: builder.query<
      {
        success: boolean;
        data: {
          name: string;
          initials: string;
          currentLevel: number;
          currentStage: number;
          referralCode: string;
        };
      },
      string
    >({
      query: (referralCode) => `/api/auth/inviter?referralCode=${referralCode}`,
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRefreshMutation,
  useGetMeQuery,
  useGetInviterQuery,
} = authApi;
