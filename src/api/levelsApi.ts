import { baseApi } from './baseApi';

export interface ProgressStage {
  stage: number;
  status: 'COMPLETED' | 'CURRENT' | 'LOCKED' | 'SKIPPED';
  bonusEarned: number;
}

export interface ProgressLevel {
  level: number;
  status: 'COMPLETED' | 'CURRENT' | 'LOCKED' | 'SKIPPED';
  stagesCompleted: number;
  stages: ProgressStage[];
}

export interface UserProgress {
  currentLevel: number;
  currentStage: number;
  startingLevel: number;
  registrationPlan: string;
  totalStages: number;
  completedStages: number;
  progressPercent: number;
  levels: ProgressLevel[];
}

export const levelsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLevelsOverview: builder.query({
      query: () => '/api/levels/overview',
      providesTags: ['Levels'],
    }),
    getProgress: builder.query<{ success: boolean; data: UserProgress }, void>({
      query: () => '/api/user/progress',
      providesTags: ['Levels'],
    }),
  }),
});

export const { useGetLevelsOverviewQuery, useGetProgressQuery } = levelsApi;
