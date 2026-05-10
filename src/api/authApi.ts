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
    forgotPassword: builder.mutation({
      query: (data: { phone: string; codeWord: string }) => ({
        url: '/api/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data: { phone: string; code: string; newPassword: string }) => ({
        url: '/api/auth/reset-password',
        method: 'POST',
        body: data,
      }),
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
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetInviterQuery,
} = authApi;
