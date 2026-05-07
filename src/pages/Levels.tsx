import { Check } from 'lucide-react'
import { CabinetLayout } from '#widgets/CabinetLayout'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useGetLevelsOverviewQuery } from '../api/levelsApi'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiStage {
  stage: number
  title: string
  bonusDescription: string
  bonusAmount: number
  bonusType: 'CASH' | 'NONE' | 'LEVEL_UP' | 'REWARD'
  isCurrentStage: boolean
  isCompleted: boolean
}

interface ApiLevel {
  level: number
  title: string
  entryFee: number
  stages: ApiStage[]
  isCurrentLevel: boolean
  isCompleted: boolean
}

type StageStatus = 'done' | 'active' | 'waiting'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBonus(stage: ApiStage): string {
  if (stage.bonusType === 'CASH' && stage.bonusAmount > 0) {
    return stage.bonusAmount.toLocaleString('ru-RU') + ' сом'
  }
  if (stage.bonusDescription) return stage.bonusDescription
  return '—'
}

function formatFee(amount: number): string {
  return amount.toLocaleString('ru-RU') + ' сом'
}

function stageStatus(stage: ApiStage): StageStatus {
  if (stage.isCompleted) return 'done'
  if (stage.isCurrentStage) return 'active'
  return 'waiting'
}

// ─── Circular progress ring ───────────────────────────────────────────────────

function CircularProgress({ value }: { value: number }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const arc = (value / 100) * circ
  return (
    <div className="relative shrink-0" style={{ width: 110, height: 110 }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#E5DDD0" strokeWidth="4" strokeDasharray="3 3" />
        <circle
          cx="55" cy="55" r={r}
          fill="none" stroke="#2C4A3E" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${arc} ${circ}`}
          transform="rotate(-90 55 55)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[17px] font-bold text-[#1A1A1A]">{value}%</span>
        <span className="text-[8px] font-semibold uppercase tracking-widest text-[#9B9589]">пройдено</span>
      </div>
    </div>
  )
}

// ─── Stage cell ───────────────────────────────────────────────────────────────

function StageCell({ stage, isLast }: { stage: ApiStage; isLast: boolean }) {
  const { t } = useTranslation()
  const status = stageStatus(stage)

  return (
    <div className={cn(
      'flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-1 p-4',
      'border-b md:border-b-0 md:border-r border-[#E5DDD0] last:border-b-0 md:last:border-r-0 flex-1 relative',
      status === 'active' ? 'bg-[#FEF3EC]/40' : 'bg-transparent'
    )}>
      {/* Vertical connector for mobile */}
      {!isLast && (
        <div className="absolute left-[30px] bottom-0 w-px h-2 bg-[#D4CFC4] md:hidden translate-y-full z-10" />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between flex-1 min-w-0 w-full">
        <div className="flex items-center gap-3">
          <div className={cn(
            'md:hidden w-8 h-8 rounded-full flex items-center justify-center shrink-0',
            status === 'done' ? 'bg-[#2C4A3E] text-white' :
            status === 'active' ? 'bg-[#E07840] text-white' : 'bg-[#F0EBE0] text-[#9B9589]'
          )}>
            {status === 'done' ? <Check size={14} strokeWidth={3} /> : (
              <span className="text-[10px] font-black">{stage.stage}</span>
            )}
          </div>
          <span className="text-[11px] font-bold text-[#1A1A1A] uppercase truncate pr-2">
            {stage.title}
          </span>
        </div>
        {status === 'active' && (
          <span className="px-1.5 py-0.5 rounded bg-[#E07840] text-[8px] font-black text-white ml-11 mt-1 md:ml-0 md:mt-0 w-fit">
            {t('common.active').toUpperCase()}
          </span>
        )}
      </div>

      <div className="md:mt-2 text-right md:text-left shrink-0">
        <p className={cn(
          'text-xs font-bold',
          status === 'waiting' ? 'text-[#9B9589]' : 'text-[#1A1A1A]'
        )}>
          {formatBonus(stage)}
        </p>
        <p className="text-[9px] font-medium text-[#9B9589] mt-0.5 uppercase tracking-tighter">
          {status === 'done' ? t('common.confirmed') :
           status === 'active' ? t('common.active') : '—'}
        </p>
      </div>
    </div>
  )
}

// ─── Level row ────────────────────────────────────────────────────────────────

function LevelRow({ level, isCurrent }: { level: ApiLevel; isCurrent: boolean }) {
  return (
    <div className={cn(
      'border-b border-[#E5DDD0] last:border-b-0 flex flex-col md:flex-row shadow-sm transition-shadow',
      isCurrent ? 'hover:shadow-md' : 'opacity-70 hover:opacity-100'
    )}>
      {/* Level label */}
      <div className={cn(
        'p-5 border-b md:border-b-0 md:border-r border-[#E5DDD0] min-w-0 md:min-w-[200px]',
        'flex md:flex-col justify-between md:justify-center items-center md:items-start shrink-0',
        isCurrent ? 'bg-[#EDF5F1]' : 'bg-[#F8F5F0]'
      )}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[9px] font-bold text-[#9B9589] tracking-[0.2em] uppercase">
              LVL {level.level}
            </p>
            {isCurrent && (
              <span className="px-1.5 py-0.5 rounded bg-[#2C4A3E] text-[7px] font-black text-white uppercase tracking-wider">
                ВЫ ЗДЕСЬ
              </span>
            )}
          </div>
          <h4 className="text-base font-black text-[#1A1A1A]">{level.title}</h4>
        </div>
        <p className="text-[10px] text-[#1B2B20] font-black mt-1 uppercase tracking-tight bg-white px-2.5 py-1 rounded-full border border-[#E5DDD0] shadow-sm md:border-transparent md:bg-transparent md:p-0 md:shadow-none">
          {formatFee(level.entryFee)}
        </p>
      </div>

      {/* Stages */}
      <div className="flex flex-col md:flex-row flex-1 bg-white">
        {level.stages.map((s, i) => (
          <StageCell key={s.stage} stage={s} isLast={i === level.stages.length - 1} />
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LevelsPage() {
  const { t } = useTranslation()
  const { data: overviewData, isLoading, isError } = useGetLevelsOverviewQuery(undefined)

  if (isLoading) {
    return (
      <CabinetLayout title={t('common.levels')}>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#9B9589] font-bold animate-pulse uppercase tracking-widest">Загрузка...</p>
        </div>
      </CabinetLayout>
    )
  }

  if (isError || !overviewData?.success) {
    return (
      <CabinetLayout title={t('common.levels')}>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-400 font-bold">Ошибка загрузки данных</p>
        </div>
      </CabinetLayout>
    )
  }

  const { currentLevel, currentStage, levels } = overviewData.data

  // Total steps = 4 levels × 4 stages = 16
  const totalSteps = 16
  const completedSteps = (currentLevel - 1) * 4 + (currentStage - 1)
  const progress = Math.round((completedSteps / totalSteps) * 100)

  // Find current level title
  const currentLevelData = levels.find((l: ApiLevel) => l.level === currentLevel)
  const currentStageData = currentLevelData?.stages.find((s: ApiStage) => s.stage === currentStage)

  return (
    <CabinetLayout title={t('common.levels')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-[#1A1A1A]">{t('common.levels')}</h2>
          <p className="text-sm text-[#9B9589] mt-1 leading-relaxed">
            4 уровня по 4 этапа. Переход автоматический после выполнения условий каждого этапа.
          </p>
        </div>

        {/* Progress summary */}
        <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#2C4A3E]" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-[#9B9589] tracking-widest uppercase mb-1">
                Ваш текущий прогресс
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">
                {t('common.level')} {currentLevel} · {t('common.step')} {currentStage}
                {currentLevelData && (
                  <span className="text-[#2C4A3E]"> — {currentLevelData.title}</span>
                )}
              </h3>
              {currentStageData && (
                <p className="text-sm font-medium text-[#9B9589] mt-1">
                  {currentStageData.title}
                </p>
              )}
              <p className="text-[11px] text-[#9B9589] mt-2">
                Этап {completedSteps + 1} из {totalSteps}
              </p>
            </div>
            <div className="self-center md:self-auto">
              <CircularProgress value={progress} />
            </div>
          </div>
        </div>

        {/* Levels table */}
        <div className="bg-white border border-[#E5DDD0] rounded-3xl overflow-hidden shadow-sm">
          {/* Table header (desktop) */}
          <div className="hidden md:flex border-b border-[#E5DDD0] bg-[#F1EDE4]">
            <div className="p-4 min-w-[200px] border-r border-[#E5DDD0] text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">
              {t('common.level')}
            </div>
            <div className="p-4 flex-1 text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">
              Этапы и бонусы
            </div>
          </div>

          {levels.map((level: ApiLevel) => (
            <LevelRow
              key={level.level}
              level={level}
              isCurrent={level.level === currentLevel}
            />
          ))}
        </div>
      </div>
    </CabinetLayout>
  )
}
