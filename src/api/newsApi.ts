import { baseApi } from './baseApi';

export const newsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNews: builder.query({
      query: ({ category, page = 0, size = 20 }: { category?: string; page?: number; size?: number }) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        if (category && category !== 'ALL') params.set('category', category);
        return `/api/news?${params}`;
      },
      providesTags: ['News'],
    }),
    getNewsById: builder.query({
      query: (id: string) => `/api/news/${id}`,
      providesTags: ['News'],
    }),
    getNewsUnreadCount: builder.query({
      query: () => '/api/news/unread-count',
      providesTags: ['News'],
    }),
    getNewsComments: builder.query({
      query: ({ id, page = 0, size = 30 }: { id: string; page?: number; size?: number }) =>
        `/api/news/${id}/comments?page=${page}&size=${size}`,
      providesTags: ['News'],
    }),
    addComment: builder.mutation({
      query: ({ id, text }: { id: string; text: string }) => ({
        url: `/api/news/${id}/comments`,
        method: 'POST',
        body: { text },
      }),
      invalidatesTags: ['News'],
    }),
    deleteComment: builder.mutation({
      query: ({ newsId, commentId }: { newsId: string; commentId: string }) => ({
        url: `/api/news/${newsId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['News'],
    }),
  }),
});

export const {
  useGetNewsQuery,
  useGetNewsByIdQuery,
  useGetNewsUnreadCountQuery,
  useGetNewsCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
} = newsApi;
