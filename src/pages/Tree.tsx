import React from 'react'
import { Zap } from 'lucide-react'
import { CabinetLayout } from '#widgets/CabinetLayout'
import { useTranslation } from 'react-i18next'
import { useGetMyTreeQuery, useGetTreeBranchesQuery } from '../api/treeApi'
import { useGetDashboardQuery } from '../api/dashboardApi'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flattenChildren(children: any[]): any[] {
  const result: any[] = []
  for (const child of children ?? []) {
    result.push(child)
    if (child.children?.length) result.push(...flattenChildren(child.children))
  }
  return result
}

function colorForInitials(initials?: string) {
  const COLORS = ['#2C4A3E', '#3A7C8E', '#7C6A3A', '#3A5C8E', '#2A2A2A', '#8E7A3A', '#3A8E6A', '#7C3A3A', '#5E3A7C']
  if (!initials) return '#9B9589'
  let hash = 0
  for (const c of initials) hash = (hash * 31 + c.charCodeAt(0)) % COLORS.length
  return COLORS[hash]
}

function getInitials(name?: string) {
  if (!name) return '??'
  return name.split(' ').filter(Boolean).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
}

// ─── Cards ────────────────────────────────────────────────────────────────────

const ROOT_W = 172
const CARD_W = 148

function RootCard({ node, level, stage }: { node: any; level: number; stage: number }) {
  const { t } = useTranslation()
  const name = node?.name ?? 'Вы'
  const initials = node?.initials ?? getInitials(name)
  return (
    <div className="rounded-xl p-3 shadow-md" style={{ width: ROOT_W, backgroundColor: '#1B2B20' }}>
      <div className="mb-2">
        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold"
          style={{ backgroundColor: 'rgba(224,120,64,0.2)', color: '#E07840' }}>
          {t('dashboard.legend_you').toUpperCase()} · ROOT
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: colorForInitials(initials) }}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-white leading-tight line-clamp-2">{name}</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {t('common.level')} {level} · {t('common.step')} {stage}
          </p>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status?: string }) {
  if (status === 'COMPLETED')
    return <span className="inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold border"
      style={{ borderColor: '#4A7C5E', color: '#4A7C5E' }}>● ЗАВЕРШЁН</span>
  if (status === 'IN_PROGRESS' || status === 'ACTIVE' || status === 'PENDING')
    return <span className="inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold border"
      style={{ borderColor: '#E07840', color: '#E07840' }}>● АКТИВНЫЙ</span>
  return <span className="inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold border"
    style={{ borderColor: '#C4BFB8', color: '#9B9589' }}>● ОЖИДАНИЕ</span>
}

function MemberCard({ node, pos }: { node?: any; pos: number }) {
  if (node?.isAccelerator) {
    return (
      <div className="rounded-xl border-2 border-dashed p-3"
        style={{ width: CARD_W, borderColor: 'rgba(224,120,64,0.4)', backgroundColor: 'rgba(254,243,236,0.5)' }}>
        <div className="mb-2">
          <span className="rounded px-1.5 py-0.5 text-[9px] font-bold text-white"
            style={{ backgroundColor: '#E07840' }}>Поз. {pos}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-white"
            style={{ borderColor: 'rgba(224,120,64,0.3)', color: '#E07840' }}>
            <Zap size={14} fill="currentColor" />
          </div>
          <div>
            <p className="text-[11px] font-bold" style={{ color: '#E07840' }}>Ускоритель</p>
            <p className="text-[9px]" style={{ color: 'rgba(224,120,64,0.6)' }}>виртуальный</p>
          </div>
        </div>
      </div>
    )
  }

  const empty = !node || !node.userId
  if (empty) {
    return (
      <div className="rounded-xl border border-dashed p-3"
        style={{ width: CARD_W, borderColor: '#D4CFC4', backgroundColor: '#F8F5F0' }}>
        <div className="mb-2">
          <span className="rounded px-1.5 py-0.5 text-[9px] font-bold"
            style={{ backgroundColor: '#E5DDD0', color: '#9B9589' }}>Поз. {pos}</span>
        </div>
        <div className="flex items-center gap-2" style={{ opacity: 0.4 }}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: '#D4CFC4' }}>—</div>
          <p className="text-xs font-semibold" style={{ color: '#9B9589' }}>Свободно</p>
        </div>
      </div>
    )
  }

  const initials = node.initials ?? getInitials(node.name)
  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm" style={{ width: CARD_W, borderColor: '#E5DDD0' }}>
      <div className="mb-2">
        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold text-white"
          style={{ backgroundColor: '#1A1A1A' }}>Поз. {pos}</span>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: colorForInitials(initials) }}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold leading-tight line-clamp-2" style={{ color: '#1A1A1A' }}>
            {node.name ?? 'Участник'}
          </p>
          {(node.currentLevel || node.level) && (
            <p className="text-[9px] mt-0.5" style={{ color: '#9B9589' }}>
              Ур.{node.currentLevel ?? node.level} · Эт.{node.currentStage ?? node.stage ?? 1}
            </p>
          )}
        </div>
      </div>
      <StatusBadge status={node.stageStatus ?? node.status} />
    </div>
  )
}

// ─── Tree canvas (640 × 360 fixed, same layout as Dashboard) ─────────────────

const CANVAS_W = 640
const CANVAS_H = 360

function TreeCanvas({ nodes, rootNode, level, stage }: {
  nodes: any[]; rootNode?: any; level: number; stage: number
}) {
  const byPos = (pos: number) => nodes.find((n) => n.treePosition === pos || n.position === pos)

  return (
    <div className="relative mx-auto" style={{ width: CANVAS_W, height: CANVAS_H }}>
      <svg className="pointer-events-none absolute inset-0" width={CANVAS_W} height={CANVAS_H}>
        <g stroke="#D4CFC4" strokeWidth={1.5} strokeDasharray="4 4" fill="none" opacity="0.6">
          <path d="M 320 80 L 160 140" />
          <path d="M 320 80 L 480 140" />
          <path d="M 160 215 L 80 260" />
          <path d="M 160 215 L 240 260" />
          <path d="M 480 215 L 400 260" />
          <path d="M 480 215 L 560 260" />
        </g>
      </svg>

      {/* Root */}
      <div className="absolute z-10 transition-transform hover:scale-105 duration-200"
        style={{ top: 0, left: 320 - ROOT_W / 2 }}>
        <RootCard node={rootNode} level={level} stage={stage} />
      </div>

      {/* Level 1 */}
      <div className="absolute z-10 transition-transform hover:scale-105 duration-200"
        style={{ top: 140, left: 160 - CARD_W / 2 }}>
        <MemberCard node={byPos(1)} pos={1} />
      </div>
      <div className="absolute z-10 transition-transform hover:scale-105 duration-200"
        style={{ top: 140, left: 480 - CARD_W / 2 }}>
        <MemberCard node={byPos(2)} pos={2} />
      </div>

      {/* Level 2 */}
      <div className="absolute z-10 transition-transform hover:scale-105 duration-200"
        style={{ top: 270, left: 80 - CARD_W / 2 }}>
        <MemberCard node={byPos(3)} pos={3} />
      </div>
      <div className="absolute z-10 transition-transform hover:scale-105 duration-200"
        style={{ top: 270, left: 240 - CARD_W / 2 }}>
        <MemberCard node={byPos(4)} pos={4} />
      </div>
      <div className="absolute z-10 transition-transform hover:scale-105 duration-200"
        style={{ top: 270, left: 400 - CARD_W / 2 }}>
        <MemberCard node={byPos(5)} pos={5} />
      </div>
      <div className="absolute z-10 transition-transform hover:scale-105 duration-200"
        style={{ top: 270, left: 560 - CARD_W / 2 }}>
        <MemberCard node={byPos(6)} pos={6} />
      </div>
    </div>
  )
}

// ─── Mobile vertical list ─────────────────────────────────────────────────────

function MobileNode({ node, pos, children }: { node?: any; pos: number; children?: React.ReactNode }) {
  const empty = !node || !node.userId
  const initials = node?.initials ?? getInitials(node?.name)
  const bg = empty ? '#D4CFC4' : colorForInitials(initials)

  return (
    <div className="relative">
      {children && (
        <div className="absolute left-3.5 top-8 bottom-0 w-px" style={{ backgroundColor: '#D4CFC4' }} />
      )}
      <div className="flex items-center gap-3 py-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white z-10"
          style={{ backgroundColor: bg }}>
          {empty ? '—' : initials}
        </div>
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="text-sm font-bold truncate" style={{ color: empty ? '#9B9589' : '#1A1A1A' }}>
            {node?.name ?? 'Свободно'}
          </span>
          <span className="shrink-0 rounded px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: '#F0EBE0', color: '#9B9589' }}>
            Поз. {pos}
          </span>
        </div>
      </div>
      {children && <div className="ml-10 space-y-1">{children}</div>}
    </div>
  )
}

// ─── Bottom stats ─────────────────────────────────────────────────────────────

function BranchStatCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="flex-1 rounded-2xl border border-[#E5DDD0] bg-white p-5">
      <p className="text-[10px] font-bold text-[#9B9589] tracking-widest uppercase mb-1">{title}</p>
      <p className="text-2xl font-bold text-[#1A1A1A]">{value}</p>
      <p className="text-xs text-[#9B9589] mt-1">{sub}</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TreePage() {
  const { t } = useTranslation()
  const { data: dashData } = useGetDashboardQuery(undefined)
  const currentLevel = dashData?.data?.currentLevel ?? 1
  const currentStage = dashData?.data?.currentStage ?? 1

  const { data: treeData, isLoading } = useGetMyTreeQuery({ level: currentLevel, stage: currentStage })
  const { data: branchesData } = useGetTreeBranchesQuery(undefined)

  const tree = treeData?.data
  const rootNode = tree?.root ?? null
  const nodes: any[] = flattenChildren(rootNode?.children ?? [])
  const branches = branchesData?.data

  const progress = tree?.progress
  const filled: number = progress?.filled ?? nodes.filter((n) => n.userId).length
  const total: number = progress?.total ?? 6

  if (isLoading) {
    return (
      <CabinetLayout title={t('dashboard.tree_title')}>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#9B9589] font-bold animate-pulse uppercase tracking-widest">ЗАГРУЗКА...</p>
        </div>
      </CabinetLayout>
    )
  }

  return (
    <CabinetLayout title={t('dashboard.tree_title')}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">{t('dashboard.tree_title')}</h2>
            <p className="text-xs md:text-sm text-[#9B9589] mt-1.5 leading-relaxed">
              Дерево из 6 позиций — {t('common.level')} {currentLevel}, {t('common.step')} {currentStage}
            </p>
          </div>
          <div className="flex self-start sm:self-auto items-center gap-2 px-4 py-2 bg-white border border-[#E5DDD0] rounded-xl shadow-sm">
            <span className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">{t('common.level')}</span>
            <span className="text-sm font-bold text-[#1A1A1A]">{currentLevel}</span>
            <span className="text-[#D4CFC4]">·</span>
            <span className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">{t('common.step')}</span>
            <span className="text-sm font-bold text-[#1A1A1A]">{currentStage}</span>
          </div>
        </div>

        {/* Tree card */}
        <div className="bg-white border border-[#E5DDD0] rounded-3xl p-4 md:p-8 shadow-sm">
          {/* Card header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-[#1A1A1A] text-lg">
                {t('common.level')} {currentLevel} · {t('common.step')} {currentStage} — Incubator
              </h3>
              <p className="text-xs text-[#9B9589] mt-0.5">
                Заполнено {filled} из {total} позиций
              </p>
            </div>
            {tree?.stageStatus === 'COMPLETED' && (
              <span className="self-start sm:self-auto px-4 py-1.5 rounded-full bg-[#EDF5F1] text-[10px] font-bold text-[#4A7C5E] uppercase tracking-widest">
                ● {t('dashboard.stage_completed')}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">Прогресс</span>
              <span className="text-[10px] font-bold text-[#1A1A1A]">{filled}/{total}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE8DA' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${total > 0 ? (filled / total) * 100 : 0}%`, backgroundColor: '#4A7C5E' }} />
            </div>
          </div>

          {!rootNode && (
            <p className="text-center text-[#9B9589] py-12 font-medium">Нет данных дерева</p>
          )}

          {rootNode && (
            <>
              {/* Mobile: vertical list */}
              <div className="md:hidden bg-[#F8F5F0] rounded-2xl p-5">
                <div className="flex items-center gap-3 py-2 mb-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: '#1B2B20' }}>
                    {rootNode.initials ?? getInitials(rootNode.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate text-[#1A1A1A]">{rootNode.name ?? 'Вы'}</p>
                    <p className="text-[10px] text-[#9B9589]">ROOT · {t('common.level')} {currentLevel} · {t('common.step')} {currentStage}</p>
                  </div>
                </div>
                <div className="ml-5 border-l border-dashed border-[#D4CFC4] pl-5 space-y-1">
                  {[1, 2].map((pos) => {
                    const n = nodes.find((x) => (x.treePosition ?? x.position) === pos)
                    return (
                      <MobileNode key={pos} node={n} pos={pos}>
                        {[pos === 1 ? 3 : 5, pos === 1 ? 4 : 6].map((subPos) => {
                          const sub = nodes.find((x) => (x.treePosition ?? x.position) === subPos)
                          return <MobileNode key={subPos} node={sub} pos={subPos} />
                        })}
                      </MobileNode>
                    )
                  })}
                </div>
              </div>

              {/* Desktop: fixed canvas */}
              <div className="hidden md:block bg-[#F8F5F0] rounded-2xl overflow-x-auto">
                <div className="py-6 px-4 flex justify-center">
                  <TreeCanvas nodes={nodes} rootNode={rootNode} level={currentLevel} stage={currentStage} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5DDD0] rounded-xl text-[11px] font-bold text-[#9B9589]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1B2B20]" />
            {t('dashboard.legend_you')}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5DDD0] rounded-xl text-[11px] font-bold text-[#9B9589]">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-[#D4CFC4]" />
            {t('dashboard.legend_empty')}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5DDD0] rounded-xl text-[11px] font-bold text-[#9B9589]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4A7C5E]" />
            {t('dashboard.legend_active')}
          </div>
        </div>

        {/* Branch stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BranchStatCard
            title="ЛЕВАЯ ВЕТКА"
            value={`${branches?.left?.size ?? 0} чел.`}
            sub={branches?.left?.members?.[0]?.name
              ? `${branches.left.members[0].name} · ${branches.left.size} вглубь`
              : 'Нет участников'}
          />
          <BranchStatCard
            title="ПРАВАЯ ВЕТКА"
            value={`${branches?.right?.size ?? 0} чел.`}
            sub={branches?.right?.members?.[0]?.name
              ? `${branches.right.members[0].name} · ${branches.right.size} вглубь`
              : 'Нет участников'}
          />
        </div>

      </div>
    </CabinetLayout>
  )
}
