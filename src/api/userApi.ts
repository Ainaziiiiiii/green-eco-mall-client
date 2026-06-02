import { baseApi } from './baseApi';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => '/api/user/notifications',
    }),
    markNotificationRead: builder.mutation({
      query: (id: string) => ({
        url: `/api/user/notifications/${id}/read`,
        method: 'PATCH',
      }),
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/api/user/notifications/read-all',
        method: 'PATCH',
      }),
    }),
    getReferralQr: builder.query({
      query: () => '/api/user/referral-qr',
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: '/api/user/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    uploadAvatar: builder.mutation<{ objectKey: string; url: string }, FormData>({
      query: (formData) => ({
        url: '/api/upload?type=AVATAR',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetReferralQrQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} = userApi;
