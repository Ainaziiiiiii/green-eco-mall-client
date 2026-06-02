import { Check, Zap, Lock, SkipForward } from 'lucide-react'
import { CabinetLayout } from '#widgets/CabinetLayout'
import { useTranslation } from 'react-i18next'
import { useGetProgressQuery, ProgressStage, ProgressLevel } from '../api/levelsApi'

// ─── Config ───────────────────────────────────────────────────────────────────

const LEVEL_CONFIG = [
  { gradient: 'linear-gradient(135deg, #1B2B20 0%, #2C4A3E 100%)', accent: '#4A7C5E', name: 'Долбоор 1' },
  { gradient: 'linear-gradient(135deg, #7A4520 0%, #C46B3A 100%)', accent: '#E07840', name: 'Долбоор 2' },
  { gradient: 'linear-gradient(135deg, #1A3A5C 0%, #2A6080 100%)', accent: '#3A7C8E', name: 'Долбоор 3' },
  { gradient: 'linear-gradient(135deg, #3A1A5C 0%, #6A3A8E 100%)', accent: '#7C5A9E', name: 'Долбоор 4' },
]

const STAGE_ICONS: Record<string, string> = {
  '1_1': '🎉', '1_2': '💰', '1_3': '🏆', '1_4': '🚀',
  '2_1': '🎉', '2_2': '⚡', '2_3': '💰', '2_4': '🚀',
  '3_1': '💰', '3_2': '💰', '3_3': '🚗', '3_4': '🚀',
  '4_1': '💰', '4_2': '💰', '4_3': '🚗', '4_4': '🏠',
}

// ─── Stage card ───────────────────────────────────────────────────────────────

function StageCard({ stage, levelNum, accent }: {
  stage: ProgressStage; levelNum: number; accent: string
}) {
  const { status, bonusEarned } = stage
  const icon = STAGE_ICONS[`${levelNum}_${stage.stage}`] ?? '•'

  const isCompleted = status === 'COMPLETED'
  const isCurrent = status === 'CURRENT'
  const isLocked = status === 'LOCKED'
  const isSkipped = status === 'SKIPPED'

  return (
    <div className="relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        border: isCurrent ? `2px solid ${accent}` : '2px solid transparent',
        backgroundColor: isCompleted ? '#F8F5F0' : isCurrent ? 'white' : '#FAFAF8',
        boxShadow: isCurrent ? `0 4px 20px ${accent}30` : '0 1px 4px rgba(0,0,0,0.05)',
        opacity: isLocked ? 0.6 : 1,
      }}>

      {isCurrent && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: `0 0 0 3px ${accent}20` }} />
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
            style={{
              backgroundColor: isCompleted || isCurrent ? accent : '#E5DDD0',
              color: isCompleted || isCurrent ? 'white' : '#9B9589',
            }}>
            {isCompleted ? <Check size={13} strokeWidth={3} /> : stage.stage}
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest"
            style={{ color: isLocked || isSkipped ? '#C5BDB3' : '#9B9589' }}>
            Этап {stage.stage}
          </span>
        </div>

        {isCurrent && (
          <span className="flex items-center gap-1 text-[8px] font-black px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: accent }}>
            <Zap size={8} fill="currentColor" /> СЕЙЧАС
          </span>
        )}
        {isCompleted && (
          <span className="text-[8px] font-black text-[#4A7C5E] uppercase tracking-widest">✓ Завершён</span>
        )}
        {isSkipped && (
          <span className="flex items-center gap-1 text-[8px] font-black text-[#C5BDB3] uppercase tracking-widest">
            <SkipForward size={9} /> Пропущен
          </span>
        )}
        {isLocked && (
          <Lock size={11} className="text-[#C5BDB3]" />
        )}
      </div>

      {/* Icon */}
      <div className="px-4 py-2 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-[11px] font-bold text-[#9B9589] uppercase tracking-widest">
          Этап {stage.stage}
        </span>
      </div>

      {/* Bonus */}
      {!isSkipped && (
        <div className="mx-4 mb-4 mt-1 rounded-xl px-3 py-2"
          style={{ backgroundColor: isCompleted ? '#EDF5F1' : isCurrent ? `${accent}15` : '#F0EBE0' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
            style={{ color: isLocked ? '#C5BDB3' : '#9B9589' }}>
            Бонус
          </p>
          <p className="text-[13px] font-black leading-tight"
            style={{ color: isLocked ? '#C5BDB3' : isCompleted ? '#2C4A3E' : accent }}>
            {isCompleted && bonusEarned > 0
              ? bonusEarned.toLocaleString('ru-RU') + ' сом'
              : isCompleted ? '—' : '···'}
          </p>
        </div>
      )}
      {isSkipped && (
        <div className="mx-4 mb-4 mt-1 rounded-xl px-3 py-2 bg-[#F5F3F0]">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#C5BDB3]">
            Не участвовал
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Level card ───────────────────────────────────────────────────────────────

function LevelCard({ level }: { level: ProgressLevel }) {
  const cfg = LEVEL_CONFIG[(level.level - 1) % 4]
  const isCurrent = level.status === 'CURRENT'
  const isLocked = level.status === 'LOCKED'
  const isCompleted = level.status === 'COMPLETED'
  const isSkipped = level.status === 'SKIPPED'
  const totalStages = level.stages.length

  return (
    <div className="rounded-3xl overflow-hidden shadow-md transition-all duration-200"
      style={{
        opacity: isLocked ? 0.6 : 1,
        border: isCurrent ? '2px solid transparent' : '2px solid #E5DDD0',
        outline: isCurrent ? `3px solid ${cfg.accent}` : 'none',
        outlineOffset: isCurrent ? '2px' : '0',
      }}>

      {/* Header */}
      <div className="relative px-6 py-5 flex items-center justify-between"
        style={{ background: cfg.gradient }}>

        <div className="absolute right-0 top-0 w-32 h-32 rounded-full opacity-10 -translate-y-1/2 translate-x-1/4 bg-white" />
        <div className="absolute right-8 bottom-0 w-16 h-16 rounded-full opacity-10 translate-y-1/2 bg-white" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
              {cfg.name}
            </span>
            {isCurrent && (
              <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-white/20 text-white">
                ВЫ ЗДЕСЬ
              </span>
            )}
            {isCompleted && (
              <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-white/20 text-white">
                ✓ Завершён
              </span>
            )}
            {isSkipped && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-white/10 text-white/50">
                <SkipForward size={8} /> Пропущен
              </span>
            )}
            {isLocked && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-white/10 text-white/60">
                <Lock size={8} /> Заблокирован
              </span>
            )}
          </div>
          <h3 className="text-xl font-black text-white">{cfg.name}</h3>
          <p className="text-[10px] text-white/50 mt-1 font-bold uppercase tracking-widest">
            {isSkipped ? 'Зарегистрировался с более высокого уровня' : `${level.stagesCompleted} из ${totalStages} этапов завершено`}
          </p>
        </div>

        {/* Progress ring */}
        {!isSkipped && (
          <div className="relative shrink-0">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
              <circle cx="32" cy="32" r="26" fill="none" stroke="white" strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(level.stagesCompleted / totalStages) * 2 * Math.PI * 26} ${2 * Math.PI * 26}`}
                transform="rotate(-90 32 32)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[15px] font-black text-white">{level.stagesCompleted}/{totalStages}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stages grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white">
        {level.stages.map(s => (
          <StageCard key={s.stage} stage={s} levelNum={level.level} accent={cfg.accent} />
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LevelsPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useGetProgressQuery()

  if (isLoading) {
    return (
      <CabinetLayout title={t('common.levels')}>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#9B9589] font-bold animate-pulse uppercase tracking-widest">Загрузка...</p>
        </div>
      </CabinetLayout>
    )
  }

  if (isError || !data?.data) {
    return (
      <CabinetLayout title={t('common.levels')}>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-400 font-bold">Ошибка загрузки данных</p>
        </div>
      </CabinetLayout>
    )
  }

  const { currentLevel, currentStage, completedStages, totalStages, progressPercent, levels } = data.data

  return (
    <CabinetLayout title={t('common.levels')}>
      <div className="space-y-6 max-w-5xl">

        {/* Hero progress card */}
        <div className="rounded-3xl overflow-hidden shadow-lg"
          style={{ background: 'linear-gradient(135deg, #1B2B20 0%, #2C4A3E 60%, #3a6b54 100%)' }}>
          <div className="relative px-6 py-7">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4" />
            <div className="absolute bottom-0 left-20 w-24 h-24 rounded-full bg-white/5 translate-y-1/2" />

            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mb-2">Ваш прогресс</p>
                <h2 className="text-2xl font-black text-white mb-1">
                  Уровень {currentLevel} · Этап {currentStage}
                </h2>
                <p className="text-white/50 text-sm font-medium">
                  Шаг {completedStages} из {totalStages}
                </p>

                <div className="mt-4 w-64 max-w-full">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Общий прогресс</span>
                    <span className="text-[11px] font-black text-white">{progressPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #4A7C5E, #6BBF8A)' }} />
                  </div>
                </div>
              </div>

              {/* Big ring */}
              <div className="relative shrink-0 self-center">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${progressPercent / 100 * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{progressPercent}%</span>
                  <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest">пройдено</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Level cards */}
        <div className="space-y-5">
          {levels.map((level: ProgressLevel) => (
            <LevelCard key={level.level} level={level} />
          ))}
        </div>
      </div>
    </CabinetLayout>
  )
}
