import { baseApi } from './baseApi';

export const levelsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLevelsOverview: builder.query({
      query: () => '/api/levels/overview',
      providesTags: ['Levels'],
    }),
  }),
});

export const { useGetLevelsOverviewQuery } = levelsApi;
