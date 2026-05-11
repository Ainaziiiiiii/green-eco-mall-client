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
    }),
    getNewsUnreadCount: builder.query({
      query: () => '/api/news/unread-count',
      providesTags: ['News'],
    }),
  }),
});

export const {
  useGetNewsQuery,
  useGetNewsByIdQuery,
  useGetNewsUnreadCountQuery,
} = newsApi;
