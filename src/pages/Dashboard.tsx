import React from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, LayoutGrid, Plus, QrCode } from 'lucide-react'
import { CabinetLayout } from '#widgets/CabinetLayout'
import { useGetDashboardQuery } from '../api/dashboardApi'
import { useGetMyTreeQuery } from '../api/treeApi'
import { useGetLevelsOverviewQuery } from '../api/levelsApi'

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, unit, sub, dark }: {
  label: string; value: string; unit: string; sub: string; dark?: boolean
}) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${dark ? '' : 'border border-[#E0D9CF] bg-white'}`}
      style={dark ? { backgroundColor: '#2C4A3E' } : {}}
    >
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em]"
        style={{ color: dark ? 'rgba(255,255,255,0.5)' : '#9B9589' }}>
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: dark ? 'white' : '#1A1A1A' }}>
          {value}
        </span>
        <span className="text-sm font-semibold" style={{ color: dark ? 'rgba(255,255,255,0.55)' : '#9B9589' }}>
          {unit}
        </span>
      </div>
      <p className="mt-1 text-xs font-medium" style={{ color: dark ? 'rgba(255,255,255,0.45)' : '#9B9589' }}>
        {sub}
      </p>
    </div>
  )
}

// ─── Node status badge ────────────────────────────────────────────────────────

type NodeStatus = 'done' | 'active' | 'waiting'

function NodeStatusBadge({ status }: { status: NodeStatus }) {
  const { t } = useTranslation()
  if (status === 'done')
    return <span className="inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold border border-[#4A7C5E] text-[#4A7C5E]">● {t('common.completed').toUpperCase()}</span>
  if (status === 'active')
    return <span className="inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold border border-[#E07840] text-[#E07840]">● {t('common.active').toUpperCase()}</span>
  return <span className="inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold border border-[#C4BFB8] text-[#9B9589]">● {t('common.waiting').toUpperCase()}</span>
}

function nodeStatus(s?: string): NodeStatus {
  if (s === 'COMPLETED') return 'done'
  if (s === 'ACTIVE' || s === 'PENDING') return 'active'
  return 'waiting'
}

function colorForInitials(initials?: string) {
  const COLORS = ['#2C4A3E', '#3A7C8E', '#7C6A3A', '#3A5C8E', '#2A2A2A', '#8E7A3A', '#3A8E6A', '#7C3A3A', '#5E3A7C']
  if (!initials) return '#9B9589'
  let hash = 0
  for (const c of initials) hash = (hash * 31 + c.charCodeAt(0)) % COLORS.length
  return COLORS[hash]
}

// ─── Org tree ─────────────────────────────────────────────────────────────────

function TreeNodeCard({ node, pos, isRoot, rootName, rootLevel, rootStage }: {
  node?: any; pos: number; isRoot?: boolean; rootName?: string; rootLevel?: number; rootStage?: number
}) {
  const { t } = useTranslation()
  const empty = !node || node.status === 'EMPTY' || !node.userId

  if (isRoot) {
    return (
      <div className="rounded-xl p-3 shadow-md" style={{ width: 155, backgroundColor: '#1B2B20' }}>
        <div className="mb-2">
          <span className="rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ backgroundColor: 'rgba(224,120,64,0.2)', color: '#E07840' }}>
            {t('dashboard.legend_you').toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: colorForInitials(node?.initials) }}>
            {node?.initials ?? rootName?.[0] ?? '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{node?.name ?? rootName ?? 'Вы'}</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {t('common.level')} {rootLevel ?? 1} · {t('common.step')} {rootStage ?? 1}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (empty) {
    return (
      <div className="rounded-xl border border-dashed border-[#D4CFC4] bg-[#F8F5F0] p-3" style={{ width: 138 }}>
        <div className="mb-2">
          <span className="rounded bg-[#E5DDD0] px-1.5 py-0.5 text-[9px] font-bold text-[#9B9589]">Поз. {pos}</span>
        </div>
        <div className="flex items-center gap-2 opacity-40">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D4CFC4] text-[10px] font-bold text-white">—</div>
          <p className="text-xs font-semibold text-[#9B9589]">Свободно</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm" style={{ width: 138, borderColor: '#E5DDD0' }}>
      <div className="mb-2">
        <span className="rounded bg-[#1A1A1A] px-1.5 py-0.5 text-[9px] font-bold text-white">Поз. {pos}</span>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: colorForInitials(node.initials) }}>
          {node.initials ?? '?'}
        </div>
        <div>
          <p className="text-xs font-semibold text-[#1A1A1A]">{node.name ?? 'Участник'}</p>
          <p className="text-[10px] text-[#9B9589]">
            {node.currentLevel ? `Ур. ${node.currentLevel} · Эт. ${node.currentStage ?? 1}` : '—'} ·{' '}
            {node.joinedAt ? new Date(node.joinedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) : '—'}
          </p>
        </div>
      </div>
      <NodeStatusBadge status={nodeStatus(node.status)} />
    </div>
  )
}

function TreeVerticalItem({ node, pos, isRoot, isLast, children, rootName, rootLevel, rootStage }: {
  node?: any; pos: number | string; isRoot?: boolean; isLast?: boolean; children?: React.ReactNode;
  rootName?: string; rootLevel?: number; rootStage?: number
}) {
  const empty = !node || node.status === 'EMPTY' || !node.userId
  const initials = node?.initials ?? '?'
  const name = node?.name ?? (isRoot ? (rootName ?? 'Вы') : 'Свободно')
  const color = isRoot ? '#1B2B20' : empty ? '#D4CFC4' : colorForInitials(initials)

  return (
    <div className="relative">
      {!isRoot && <div className="absolute -left-4 top-0 h-8 w-px bg-[#D4CFC4]" style={{ height: 'calc(100% + 16px)' }} />}
      <div className="relative flex items-center gap-3 py-2">
        {!isRoot && <div className="absolute -left-4 top-5 h-px w-4 bg-[#D4CFC4]" />}
        <div className={`flex ${isRoot ? 'h-10 w-10' : 'h-8 w-8'} shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm`}
          style={{ backgroundColor: color }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className={`text-sm font-bold truncate ${empty ? 'text-[#9B9589]' : 'text-[#1A1A1A]'}`}>{name}</span>
            {!isRoot && (
              <span className="shrink-0 rounded bg-[#F0EBE0] px-1 py-0.5 text-[8px] font-bold text-[#9B9589] uppercase tracking-wider">
                Поз. {pos}
              </span>
            )}
          </div>
          {!empty && !isRoot && <div className="mt-0.5"><NodeStatusBadge status={nodeStatus(node?.status)} /></div>}
        </div>
      </div>
      {children && <div className="ml-10 space-y-1">{children}</div>}
    </div>
  )
}

function OrgTree({ nodes, filled, total, rootUser, currentLevel, currentStage }: {
  nodes: any[]; filled: number; total: number; rootUser?: any; currentLevel?: number; currentStage?: number
}) {
  const byPos = (pos: number) => nodes.find((n) => n.treePosition === pos || n.position === pos)

  return (
    <div className="bg-[#F8F5F0] rounded-2xl overflow-hidden shadow-inner-sm">
      {/* Mobile: vertical list */}
      <div className="md:hidden p-5">
        <TreeVerticalItem node={rootUser} pos="ROOT" isRoot rootName={rootUser?.name} rootLevel={currentLevel} rootStage={currentStage}>
          <TreeVerticalItem node={byPos(1)} pos={1}>
            <TreeVerticalItem node={byPos(3)} pos={3} />
            <TreeVerticalItem node={byPos(4)} pos={4} isLast />
          </TreeVerticalItem>
          <TreeVerticalItem node={byPos(2)} pos={2} isLast>
            <TreeVerticalItem node={byPos(5)} pos={5} />
            <TreeVerticalItem node={byPos(6)} pos={6} isLast />
          </TreeVerticalItem>
        </TreeVerticalItem>
      </div>

      {/* Desktop: graphical pyramid */}
      <div className="hidden md:block relative">
        <div className="overflow-x-auto p-4 md:p-8 scrollbar-hide">
          <div className="relative mx-auto py-4" style={{ width: 640, height: 360 }}>
            <svg className="pointer-events-none absolute inset-0" width="640" height="360">
              <g stroke="#D4CFC4" strokeWidth={1.5} strokeDasharray="4 4" fill="none" opacity="0.6">
                <path d="M 320 80 L 160 140" />
                <path d="M 320 80 L 480 140" />
                <path d="M 160 215 L 80 260" />
                <path d="M 160 215 L 240 260" />
                <path d="M 480 215 L 400 260" />
                <path d="M 480 215 L 560 260" />
              </g>
            </svg>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 transition-transform hover:scale-105 duration-300">
              <TreeNodeCard node={rootUser} pos={0} isRoot rootName={rootUser?.name} rootLevel={currentLevel} rootStage={currentStage} />
            </div>
            <div className="absolute top-[140px] left-[90px] z-10 transition-transform hover:scale-105 duration-300">
              <TreeNodeCard node={byPos(1)} pos={1} />
            </div>
            <div className="absolute top-[140px] left-[410px] z-10 transition-transform hover:scale-105 duration-300">
              <TreeNodeCard node={byPos(2)} pos={2} />
            </div>
            <div className="absolute top-[260px] left-[10px] z-10 transition-transform hover:scale-105 duration-300">
              <TreeNodeCard node={byPos(3)} pos={3} />
            </div>
            <div className="absolute top-[260px] left-[170px] z-10 transition-transform hover:scale-105 duration-300">
              <TreeNodeCard node={byPos(4)} pos={4} />
            </div>
            <div className="absolute top-[260px] left-[330px] z-10 transition-transform hover:scale-105 duration-300">
              <TreeNodeCard node={byPos(5)} pos={5} />
            </div>
            <div className="absolute top-[260px] left-[490px] z-10 transition-transform hover:scale-105 duration-300">
              <TreeNodeCard node={byPos(6)} pos={6} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Stage progress item ──────────────────────────────────────────────────────

function StageProgressItem({ stage, currentStage }: { stage: any; currentStage: number }) {
  const { t } = useTranslation()
  const stageNum: number = stage.stageNumber ?? stage.stage ?? stage.num ?? 0
  const status: NodeStatus = stage.isCompleted ? 'done' : stageNum === currentStage ? 'active' : 'waiting'
  const barColor = status === 'done' ? '#4A7C5E' : status === 'active' ? '#E07840' : '#E5DDD0'
  const barWidth = status === 'done' ? '100%' : status === 'active' ? '45%' : '0%'

  const bonusText = stage.bonusType === 'CASH'
    ? `${(stage.bonusAmount ?? 0).toLocaleString('ru-RU')} сом`
    : (stage.bonusDescription ?? '—')

  const condition = stage.condition ?? stage.requiredPositions
    ? `${stage.requiredPositions} позиций`
    : stage.conditionDescription ?? '—'

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-[#9B9589] uppercase">{t('common.step')} {stageNum}</span>
          <span className="text-sm font-semibold text-[#1A1A1A]">{stage.title ?? stage.name ?? `Этап ${stageNum}`}</span>
        </div>
        {status === 'done' && <span className="shrink-0 rounded-full bg-[#EDF5F1] px-2 py-0.5 text-[9px] font-bold text-[#4A7C5E]">● {t('common.completed').toUpperCase()}</span>}
        {status === 'active' && <span className="shrink-0 rounded-full bg-[#FEF3EC] px-2 py-0.5 text-[9px] font-bold text-[#E07840]">● {t('common.active').toUpperCase()}</span>}
        {status === 'waiting' && <span className="shrink-0 rounded-full bg-[#F5F3F0] px-2 py-0.5 text-[9px] font-bold text-[#9B9589]">{t('common.waiting').toUpperCase()}</span>}
      </div>
      <p className="mb-1.5 text-[11px] text-[#9B9589]">{condition}</p>
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: '#EDE8DA' }}>
          <div className="h-full rounded-full transition-all" style={{ width: barWidth, backgroundColor: barColor }} />
        </div>
        <span className="shrink-0 text-[11px] font-semibold text-[#9B9589]">{bonusText}</span>
      </div>
    </div>
  )
}

// ─── Activity item ────────────────────────────────────────────────────────────

function ActivityItem({ initials, name, action, time }: {
  initials: string; name: string; action: string; time: string
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: colorForInitials(initials) }}>
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#1A1A1A]">{name}</p>
        <p className="text-xs text-[#9B9589]">{action}</p>
      </div>
      <p className="shrink-0 text-[11px] text-[#9B9589]">{time}</p>
    </div>
  )
}

// ─── Bonus row ────────────────────────────────────────────────────────────────

const BONUS_STATUS_MAP: Record<string, { className: string; label: string }> = {
  PENDING:   { className: 'border border-[#E07840] text-[#E07840]', label: '● ОЖИДАЕТ' },
  CONFIRMED: { className: 'bg-[#EDF5F1] text-[#4A7C5E]',           label: '● ПОДТВЕРЖДЁН' },
  PAID:      { className: 'bg-[#2C4A3E] text-white',                label: '● ВЫПЛАЧЕН' },
}

const BONUS_TYPE_MAP: Record<string, string> = {
  REFERRAL_DIRECT:   'Прямой реферал',
  REFERRAL_INDIRECT: 'Косвенный реферал',
  STAGE:             'Завершение этапа',
  DIVIDEND:          'Дивиденды',
}

function BonusRow({ bonus }: { bonus: any }) {
  const st = BONUS_STATUS_MAP[bonus.status] ?? BONUS_STATUS_MAP.PENDING
  const description = bonus.fromUserName
    ? `${BONUS_TYPE_MAP[bonus.type] ?? bonus.type} — от ${bonus.fromUserName}`
    : (BONUS_TYPE_MAP[bonus.type] ?? bonus.type)
  const date = new Date(bonus.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })

  return (
    <>
      <tr className="hidden md:table-row border-b border-[#F0EBE0] last:border-0">
        <td className="py-4 pr-3 text-xs text-[#9B9589] font-medium">{date}</td>
        <td className="py-4 pr-3 text-xs text-[#1A1A1A] font-bold">{description}</td>
        <td className="py-4 pr-3 text-right text-xs font-black text-[#1A1A1A]">{(bonus.amount ?? 0).toLocaleString('ru-RU')} сом</td>
        <td className="py-4 text-right">
          <span className={`inline-block rounded-full px-3 py-1 text-[9px] font-black tracking-widest ${st.className}`}>{st.label}</span>
        </td>
      </tr>
      <div className="md:hidden py-4 border-b border-[#F0EBE0] last:border-0">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">{date}</span>
          <span className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-black tracking-widest ${st.className}`}>{st.label}</span>
        </div>
        <p className="text-[13px] font-bold text-[#1A1A1A] mb-1">{description}</p>
        <p className="text-sm font-black text-[#2C4A3E]">{(bonus.amount ?? 0).toLocaleString('ru-RU')} сом</p>
      </div>
    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { t } = useTranslation()
  const { data: dashboardData, isLoading, isError } = useGetDashboardQuery(undefined)
  const data = dashboardData?.data

  const { data: treeData } = useGetMyTreeQuery(
    { level: data?.currentLevel ?? 1, stage: data?.currentStage ?? 1 },
    { skip: !data?.currentLevel }
  )
  const { data: levelsData } = useGetLevelsOverviewQuery(undefined)

  const rawTreeNodes = treeData?.data?.nodes ?? treeData?.data?.members ?? treeData?.data
  const treeNodes: any[] = Array.isArray(rawTreeNodes) ? rawTreeNodes : []
  const rootUser = treeData?.data?.root ?? treeData?.data?.rootUser ?? null

  const allLevels: any[] = levelsData?.data?.levels ?? []
  const currentLevelData = allLevels.find((l) => l.level === data?.currentLevel) ?? allLevels[0]
  const stages: any[] = currentLevelData?.stages ?? []

  if (isLoading) return (
    <CabinetLayout title={t('common.dashboard')}>
      <div className="flex items-center justify-center h-64">
        <p className="text-[#9B9589] font-bold animate-pulse uppercase tracking-widest">Загрузка...</p>
      </div>
    </CabinetLayout>
  )

  if (isError) return (
    <CabinetLayout title={t('common.dashboard')}>
      <div className="flex items-center justify-center h-64 text-[#E07840] font-bold uppercase tracking-widest">
        Ошибка загрузки
      </div>
    </CabinetLayout>
  )

  return (
    <CabinetLayout title={t('common.dashboard')}>
      <div className="space-y-5">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
              {t('dashboard.welcome', { name: data?.firstName || 'Участник' })}
            </h2>
            <p className="mt-1.5 max-w-xl text-xs md:text-sm text-[#9B9589] leading-relaxed">
              {t('dashboard.status_summary', {
                level: data?.currentLevel || 1,
                stage: data?.currentStage || 1,
                name: currentLevelData?.title || 'Участник',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => data?.referralLink && navigator.clipboard.writeText(data.referralLink)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border border-[#E5DDD0] bg-white px-5 py-3 text-sm font-bold text-[#1A1A1A] transition-all hover:bg-[#F8F5F0] hover:shadow-sm"
            >
              <LayoutGrid size={16} strokeWidth={2} />
              <span className="whitespace-nowrap">{t('dashboard.my_link')}</span>
            </button>
            <button
              onClick={() => data?.referralLink && navigator.clipboard.writeText(data.referralLink)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[#333] hover:shadow-lg hover:shadow-black/10"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>{t('dashboard.invite')}</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label={t('dashboard.balance')}
            value={data?.balance?.toLocaleString('ru-RU') || '0'}
            unit={t('common.currency')}
            sub={t('dashboard.weekly_growth', { amount: '' })}
            dark
          />
          <StatCard
            label={t('dashboard.pending')}
            value={data?.pendingBonuses?.toLocaleString('ru-RU') || '0'}
            unit={t('common.currency')}
            sub={t('dashboard.pending_hint')}
          />
          <StatCard
            label={t('dashboard.total_earned')}
            value={data?.totalEarned?.toLocaleString('ru-RU') || '0'}
            unit={t('common.currency')}
            sub={t('dashboard.bonus_confirmed', { count: data?.recentBonuses?.length || 0 })}
          />
          <StatCard
            label={t('dashboard.team_count')}
            value={data?.teamSize?.toString() || '0'}
            unit="чел."
            sub={t('dashboard.today_growth', { count: 0 })}
          />
        </div>

        {/* Tree + right panel */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          {/* Tree card */}
          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-4 md:p-8 flex flex-col shadow-sm">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <h3 className="font-bold text-[#1A1A1A] text-lg">{t('dashboard.tree_title')}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#9B9589] bg-[#F8F5F0] px-2 py-0.5 rounded">
                    {data?.treeSummary?.filled ?? 0} / {data?.treeSummary?.total ?? 6} {t('dashboard.filled')}
                  </span>
                  {data?.treeSummary?.filled === data?.treeSummary?.total && data?.treeSummary?.total > 0 && (
                    <span className="rounded-full bg-[#EDF5F1] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4A7C5E]">
                      ● {t('dashboard.stage_completed')}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[11px] font-bold text-[#9B9589] uppercase tracking-widest">
                {t('common.level')} {data?.currentLevel || 1} · {t('common.step')} {data?.currentStage || 1}
              </p>
            </div>

            <OrgTree
              nodes={treeNodes}
              filled={data?.treeSummary?.filled ?? 0}
              total={data?.treeSummary?.total ?? 6}
              rootUser={rootUser}
              currentLevel={data?.currentLevel}
              currentStage={data?.currentStage}
            />

            {/* Legend */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-[#F0EBE0]">
              {[
                { bg: '#1B2B20', label: t('dashboard.legend_you') },
                { bg: '#E5F0E8', border: '#4A7C5E', label: t('dashboard.legend_completed') },
                { bg: '#F0EBE0', border: '#D4CFC4', label: t('dashboard.legend_team') },
                { bg: '#F8F5F0', border: '#D4CFC4', label: t('dashboard.legend_free') },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 rounded-sm shadow-sm"
                    style={{ backgroundColor: item.bg, border: item.border ? `1px solid ${item.border}` : undefined }} />
                  <span className="text-[11px] font-bold text-[#9B9589] uppercase tracking-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-6">
            {/* Stage progress */}
            <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 md:p-7 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-bold text-[#1A1A1A]">{t('dashboard.stages_title')}</h3>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B9589]">
                  LEVEL {data?.currentLevel || 1}
                </span>
              </div>
              <div className="space-y-5">
                {stages.length > 0
                  ? stages.map((stage: any, i: number) => (
                      <StageProgressItem key={i} stage={stage} currentStage={data?.currentStage ?? 1} />
                    ))
                  : [1, 2, 3, 4].map((n) => (
                      <StageProgressItem
                        key={n}
                        stage={{ stageNumber: n, title: `Этап ${n}`, isCompleted: n < (data?.currentStage ?? 1), bonusType: 'NONE' }}
                        currentStage={data?.currentStage ?? 1}
                      />
                    ))
                }
              </div>
              <button className="w-full mt-8 py-3 text-xs font-bold text-[#9B9589] border border-[#E5DDD0] rounded-xl hover:bg-[#F8F5F0] transition-colors uppercase tracking-widest">
                {t('dashboard.all_levels')}
              </button>
            </div>

            {/* Referral */}
            <div className="rounded-3xl p-7 text-white shadow-xl shadow-black/10 relative overflow-hidden" style={{ backgroundColor: '#1B2B20' }}>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">{t('dashboard.your_code')}</p>
                  <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
                    <QrCode size={12} className="text-white/60" />
                  </div>
                </div>
                <h3 className="mb-1 text-3xl font-bold tracking-widest font-mono">{data?.referralCode || '...'}</h3>
                <p className="mb-8 text-[11px] font-medium text-white/30 truncate">{data?.referralLink || '...'}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => data?.referralLink && navigator.clipboard.writeText(data.referralLink)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-bold text-white bg-white/10 hover:bg-white/20 transition-all uppercase tracking-widest"
                  >
                    <Copy size={14} />
                    {t('dashboard.copy_link')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity + Bonuses */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-8">
          {/* Team activity */}
          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 md:p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-bold text-[#1A1A1A] text-lg">{t('dashboard.activity')}</h3>
            </div>
            <div className="divide-y divide-[#F0EBE0]">
              {(data?.recentActivity ?? []).length > 0
                ? data.recentActivity.map((a: any, i: number) => (
                    <ActivityItem
                      key={i}
                      initials={a.initials ?? a.name?.[0] ?? '?'}
                      name={a.name ?? 'Участник'}
                      action={a.description ?? a.action ?? ''}
                      time={new Date(a.occurredAt ?? a.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    />
                  ))
                : <p className="py-4 text-xs text-[#9B9589]">Нет последних событий</p>
              }
            </div>
          </div>

          {/* Recent bonuses */}
          <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 md:p-8 shadow-sm overflow-hidden">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-bold text-[#1A1A1A] text-lg">{t('dashboard.recent_bonuses')}</h3>
            </div>
            <div className="overflow-hidden">
              <table className="w-full hidden md:table">
                <thead>
                  <tr className="border-b border-[#F0EBE0]">
                    {[t('dashboard.table_date'), t('dashboard.table_desc'), t('dashboard.table_amount'), t('dashboard.table_status')].map((h) => (
                      <th key={h} className="pb-4 text-left text-[9px] font-bold uppercase tracking-widest text-[#9B9589]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentBonuses ?? []).map((bonus: any) => <BonusRow key={bonus.id} bonus={bonus} />)}
                </tbody>
              </table>
              <div className="md:hidden">
                {(data?.recentBonuses ?? []).map((bonus: any) => <BonusRow key={bonus.id} bonus={bonus} />)}
              </div>
              {!(data?.recentBonuses?.length) && <p className="py-4 text-xs text-[#9B9589]">Нет последних бонусов</p>}
            </div>
          </div>
        </div>
      </div>
    </CabinetLayout>
  )
}
