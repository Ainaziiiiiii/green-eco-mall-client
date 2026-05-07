import { baseApi } from './baseApi';

export const bonusesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBonusSummary: builder.query({
      query: () => '/api/bonuses/summary',
      providesTags: ['Bonuses'],
    }),
    getBonuses: builder.query<any, { type?: string; status?: string; page?: number; limit?: number }>({
      query: ({ type, status, page = 0, limit = 20 } = {}) => {
        const p = new URLSearchParams();
        if (type) p.set('type', type);
        if (status) p.set('status', status);
        p.set('page', String(page));
        p.set('limit', String(limit));
        return `/api/bonuses?${p}`;
      },
      providesTags: ['Bonuses'],
    }),
  }),
});

export const { useGetBonusSummaryQuery, useGetBonusesQuery } = bonusesApi;
