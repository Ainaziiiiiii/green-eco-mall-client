import { baseApi } from './baseApi';

export const treeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTreeOverview: builder.query({
      query: () => '/api/tree/overview',
      providesTags: ['Tree'],
    }),
    getMyTree: builder.query({
      query: ({ level, stage }) => `/api/tree/my?level=${level}&stage=${stage}`,
      providesTags: ['Tree'],
    }),
    getTreeBranches: builder.query({
      query: () => '/api/tree/branches',
      providesTags: ['Tree'],
    }),
    getTreeActivity: builder.query({
      query: () => '/api/tree/activity',
      providesTags: ['Tree'],
    }),
  }),
});

export const {
  useGetTreeOverviewQuery,
  useGetMyTreeQuery,
  useGetTreeBranchesQuery,
  useGetTreeActivityQuery,
} = treeApi;
