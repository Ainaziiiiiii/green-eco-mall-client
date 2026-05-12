import React, { useState } from 'react'
import { Zap, X, Copy, Check, Users, GitBranch } from 'lucide-react'
import { CabinetLayout } from '#widgets/CabinetLayout'
import { useTranslation } from 'react-i18next'
import { useGetMyTreeQuery, useGetTreeBranchesQuery, useGetTreeMemberQuery, useGetStage2RaceQuery } from '../api/treeApi'
import { useGetDashboardQuery } from '../api/dashboardApi'
import { useGetMeQuery } from '../api/authApi'

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Layout engine ────────────────────────────────────────────────────────────
// Places nodes on a canvas by counting leaf nodes per subtree.
// Each leaf occupies H_UNIT px. Internal nodes are centered over their children.
// Global position: root=0, root's children=1,2, their children=3-6, etc. (binary tree numbering)

const CARD_W = 138
const ROOT_W = 165
const CARD_H = 82
const H_UNIT = 152   // CARD_W + gap between cards
const V_STEP = 134   // vertical distance between level tops
const PAD = 24

interface LayoutNode {
  node: any
  cx: number    // horizontal center
  y: number     // top edge
  depth: number
  gPos: number  // global position (0 = root)
}

interface Edge { x1: number; y1: number; x2: number; y2: number }

function leafCount(node: any): number {
  if (!node?.children?.length) return 1
  return (node.children as any[]).reduce((s: number, c: any) => s + leafCount(c), 0)
}

function treeDepth(node: any): number {
  if (!node?.children?.length) return 0
  return 1 + Math.max(...(node.children as any[]).map(treeDepth))
}

function buildLayout(root: any): { nodes: LayoutNode[]; canvasW: number; canvasH: number } {
  const lc = leafCount(root)
  const depth = treeDepth(root)
  const canvasW = Math.max(PAD * 2 + lc * H_UNIT - (H_UNIT - CARD_W), ROOT_W + PAD * 2)
  const canvasH = PAD * 2 + depth * V_STEP + CARD_H
  const nodes: LayoutNode[] = []

  function walk(node: any, leftLeaf: number, d: number, gPos: number) {
    const lc = leafCount(node)
    // Center x = left edge + half the occupied width (including all gaps between leaves)
    const cx = PAD + leftLeaf * H_UNIT + (lc * H_UNIT - (H_UNIT - CARD_W)) / 2
    const y = PAD + d * V_STEP
    nodes.push({ node, cx, y, depth: d, gPos })
    if (node?.children?.length) {
      let cl = leftLeaf
      ;(node.children as any[]).forEach((child: any, i: number) => {
        // Standard binary tree numbering: left=2g+1, right=2g+2 (g=0 for root)
        walk(child, cl, d + 1, gPos === 0 ? i + 1 : gPos * 2 + i + 1)
        cl += leafCount(child)
      })
    }
  }

  walk(root, 0, 0, 0)
  return { nodes, canvasW, canvasH }
}

function buildEdges(nodes: LayoutNode[]): Edge[] {
  const map = new Map<any, LayoutNode>()
  nodes.forEach(n => map.set(n.node, n))
  return nodes.flatMap(({ node, cx, y }) => {
    if (!node?.children?.length) return []
    return (node.children as any[]).map((child: any) => {
      const c = map.get(child)!
      return { x1: cx, y1: y + CARD_H, x2: c.cx, y2: c.y }
    })
  })
}

// ─── Member Modal ─────────────────────────────────────────────────────────────

function MemberModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const { data, isLoading } = useGetTreeMemberQuery(userId)
  const member = data?.data

  const handleCopy = () => {
    if (!member?.referralLink) return
    navigator.clipboard.writeText(member.referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const joinedAt = member?.joinedAt
    ? new Date(member.joinedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-5" style={{ backgroundColor: '#1B2B20' }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
          >
            <X size={16} />
          </button>

          {isLoading ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <div className="h-3 w-20 rounded animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0"
                style={{ backgroundColor: colorForInitials(member?.initials) }}
              >
                {member?.initials ?? '??'}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-white leading-tight">{member?.name ?? '—'}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
                    Ур. {member?.currentLevel ?? '—'} · Эт. {member?.currentStage ?? '—'}
                  </span>
                  {member?.accountStatus === 'ACTIVE' && (
                    <span className="text-[10px] font-bold text-[#4A7C5E] uppercase tracking-widest">● Активен</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Team stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Users, label: 'Команда', value: member?.teamSize ?? '—' },
              { icon: GitBranch, label: 'Лев. ветка', value: member?.leftBranchSize ?? '—' },
              { icon: GitBranch, label: 'Прав. ветка', value: member?.rightBranchSize ?? '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl p-3 text-center" style={{ backgroundColor: '#F8F5F0' }}>
                <Icon size={14} className="mx-auto mb-1" style={{ color: '#9B9589' }} />
                <p className="text-lg font-bold text-[#1A1A1A]">{isLoading ? '—' : value}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#9B9589' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Join date */}
          {joinedAt && (
            <div className="flex items-center justify-between py-3 border-t border-[#F0EBE0]">
              <span className="text-[11px] font-bold text-[#9B9589] uppercase tracking-widest">Дата вступления</span>
              <span className="text-[13px] font-bold text-[#1A1A1A]">{joinedAt}</span>
            </div>
          )}

          {/* Referral link */}
          {member?.referralLink && (
            <div className="rounded-2xl p-4" style={{ backgroundColor: '#F8F5F0' }}>
              <p className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest mb-2">Реферальная ссылка</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-[#1A1A1A] font-medium truncate flex-1">{member.referralLink}</p>
                <button
                  onClick={handleCopy}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all"
                  style={copied
                    ? { backgroundColor: '#EDF5F1', color: '#4A7C5E' }
                    : { backgroundColor: '#1B2B20', color: 'white' }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Скопировано' : 'Копировать'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Cards ────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
  if (status === 'COMPLETED')
    return <span className="inline-block rounded-full px-1.5 py-0.5 text-[8px] font-bold border"
      style={{ borderColor: '#4A7C5E', color: '#4A7C5E' }}>● ЗАВЕРШЁН</span>
  if (['IN_PROGRESS', 'ACTIVE', 'PENDING'].includes(status ?? ''))
    return <span className="inline-block rounded-full px-1.5 py-0.5 text-[8px] font-bold border"
      style={{ borderColor: '#E07840', color: '#E07840' }}>● АКТИВНЫЙ</span>
  return null
}

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
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ backgroundColor: colorForInitials(initials) }}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold text-white leading-tight line-clamp-2">{name}</p>
          <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {t('common.level')} {level} · {t('common.step')} {stage}
          </p>
        </div>
      </div>
    </div>
  )
}

function EmptySlotCard({ gPos }: { gPos: number }) {
  return (
    <div className="rounded-xl border-2 border-dashed p-2.5"
      style={{ width: CARD_W, borderColor: '#D4CFC4', backgroundColor: '#F8F5F0' }}>
      <div className="mb-1.5 flex items-center justify-between gap-1">
        <span className="rounded px-1 py-0.5 text-[8px] font-bold"
          style={{ backgroundColor: '#E5DDD0', color: '#9B9589' }}>Поз. {gPos}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-dashed"
          style={{ borderColor: '#D4CFC4' }}>
          <span style={{ color: '#C5BDB3', fontSize: 14, lineHeight: 1 }}>+</span>
        </div>
        <p className="text-[10px] font-medium" style={{ color: '#C5BDB3' }}>Свободно</p>
      </div>
    </div>
  )
}

function MemberCard({ node, gPos }: { node: any; gPos: number }) {
  if (node?.isEmpty || (!node?.name && !node?.initials && !node?.isAccelerator)) {
    return <EmptySlotCard gPos={gPos} />
  }

  if (node?.isAccelerator) {
    return (
      <div className="rounded-xl border-2 border-dashed p-2.5"
        style={{ width: CARD_W, borderColor: 'rgba(224,120,64,0.5)', backgroundColor: 'rgba(254,243,236,0.6)' }}>
        <div className="mb-1.5 flex items-center justify-between gap-1">
          <span className="rounded px-1 py-0.5 text-[8px] font-bold text-white"
            style={{ backgroundColor: '#E07840' }}>Поз. {gPos}</span>
          <span className="text-[8px] font-bold" style={{ color: '#E07840' }}>УСКОР.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-white"
            style={{ borderColor: 'rgba(224,120,64,0.4)', color: '#E07840' }}>
            <Zap size={13} fill="currentColor" />
          </div>
          <p className="text-[11px] font-bold" style={{ color: '#E07840' }}>Ускоритель</p>
        </div>
      </div>
    )
  }

  const initials = node.initials ?? getInitials(node.name)
  return (
    <div className="rounded-xl border bg-white p-2.5 shadow-sm" style={{ width: CARD_W, borderColor: '#E5DDD0' }}>
      <div className="mb-1.5 flex items-center justify-between gap-1">
        <span className="rounded px-1 py-0.5 text-[8px] font-bold text-white"
          style={{ backgroundColor: '#1A1A1A' }}>Поз. {gPos}</span>
        <StatusBadge status={node.stageStatus ?? node.status} />
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: colorForInitials(initials) }}>
          {initials}
        </div>
        <p className="text-[11px] font-semibold leading-tight line-clamp-2 min-w-0 flex-1" style={{ color: '#1A1A1A' }}>
          {node.name ?? 'Участник'}
        </p>
      </div>
    </div>
  )
}

// ─── Tree canvas ──────────────────────────────────────────────────────────────

function TreeCanvas({ rootNode, level, stage, onNodeClick }: {
  rootNode: any; level: number; stage: number; onNodeClick: (id: string) => void
}) {
  const { nodes, canvasW, canvasH } = buildLayout(rootNode)
  const edges = buildEdges(nodes)

  return (
    <div className="relative" style={{ width: canvasW, height: canvasH }}>
      <svg className="pointer-events-none absolute inset-0" width={canvasW} height={canvasH}>
        {edges.map((e, i) => {
          const midY = (e.y1 + e.y2) / 2
          return (
            <path key={i}
              d={`M ${e.x1} ${e.y1} C ${e.x1} ${midY}, ${e.x2} ${midY}, ${e.x2} ${e.y2}`}
              stroke="#D4CFC4" strokeWidth={1.5} strokeDasharray="4 4" fill="none" opacity="0.7"
            />
          )
        })}
      </svg>

      {nodes.map((n, i) => {
        const isClickable = n.depth > 0 && n.node?.userId && !n.node?.isEmpty && !n.node?.isAccelerator
        return (
          <div
            key={i}
            className="absolute z-10 transition-transform hover:scale-105 duration-200"
            style={{
              left: n.cx - (n.depth === 0 ? ROOT_W : CARD_W) / 2,
              top: n.y,
              cursor: isClickable ? 'pointer' : 'default',
            }}
            onClick={isClickable ? () => onNodeClick(n.node.userId) : undefined}
          >
            {n.depth === 0
              ? <RootCard node={n.node} level={level} stage={stage} />
              : <MemberCard node={n.node} gPos={n.gPos} />
            }
          </div>
        )
      })}
    </div>
  )
}

// ─── Mobile tree list ────────────────────────────────────────────────────────

const LINE_COLORS = ['#4A7C5E', '#3A7C8E', '#7C6A3A', '#E07840', '#8E5A3A']

function MobileEmptySlot({ gPos }: { gPos: number }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
      style={{ border: '2px dashed #D4CFC4', backgroundColor: '#F8F5F0' }}>
      <div className="flex shrink-0 items-center justify-center rounded-full border-2 border-dashed"
        style={{ width: 32, height: 32, minWidth: 32, borderColor: '#D4CFC4' }}>
        <span style={{ color: '#C5BDB3', fontSize: 16, lineHeight: 1 }}>+</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-[13px]" style={{ color: '#C5BDB3' }}>Свободно</span>
          <span className="rounded px-1.5 py-0.5 text-[8px] font-bold"
            style={{ backgroundColor: '#E5DDD0', color: '#9B9589' }}>Поз. {gPos}</span>
        </div>
      </div>
    </div>
  )
}

function MobileTreeNode({ node, gPos, depth, onNodeClick }: {
  node: any; gPos: number; depth: number; onNodeClick?: (id: string) => void
}) {
  const isEmpty = node?.isEmpty || (!node?.name && !node?.initials && !node?.isAccelerator && depth > 0)
  const isAccelerator = node?.isAccelerator === true
  const initials = node?.initials ?? getInitials(node?.name)
  const bg = depth === 0 ? '#1B2B20' : isAccelerator ? 'white' : colorForInitials(initials)
  const children: any[] = node?.children ?? []
  const isRoot = depth === 0
  const isClickable = !isRoot && !isEmpty && !isAccelerator && !!node?.userId

  if (isEmpty) {
    return (
      <div>
        <MobileEmptySlot gPos={gPos} />
        {children.length > 0 && (
          <div
            className="ml-5 mt-2 mb-1 pl-4 border-l-2 border-dashed space-y-2"
            style={{ borderColor: LINE_COLORS[Math.min(depth, LINE_COLORS.length - 1)] }}
          >
            {children.map((child: any, i: number) => (
              <MobileTreeNode
                key={i}
                node={child}
                gPos={gPos === 0 ? i + 1 : gPos * 2 + i + 1}
                depth={depth + 1}
                onNodeClick={onNodeClick}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        onClick={isClickable ? () => onNodeClick?.(node.userId) : undefined}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
        style={{
          cursor: isClickable ? 'pointer' : 'default',
          ...(isRoot
            ? { backgroundColor: '#1B2B20' }
            : isAccelerator
            ? { backgroundColor: 'rgba(254,243,236,0.7)', border: '2px dashed rgba(224,120,64,0.45)' }
            : { backgroundColor: 'white', border: '1px solid #E5DDD0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' })
        }}
      >
        <div
          className="flex shrink-0 items-center justify-center rounded-full font-bold"
          style={{
            width: isRoot ? 38 : 32, height: isRoot ? 38 : 32, minWidth: isRoot ? 38 : 32,
            fontSize: isRoot ? 13 : 11,
            backgroundColor: bg,
            color: isAccelerator ? '#E07840' : 'white',
            border: isAccelerator ? '1px solid rgba(224,120,64,0.4)' : 'none',
          }}
        >
          {isAccelerator ? <Zap size={14} fill="currentColor" /> : initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold truncate"
              style={{ fontSize: isRoot ? 14 : 13, color: isRoot ? 'white' : isAccelerator ? '#E07840' : '#1A1A1A' }}>
              {isAccelerator ? 'Ускоритель' : (node?.name ?? 'Участник')}
            </span>
            {gPos > 0 && (
              <span className="shrink-0 rounded px-1.5 py-0.5 text-[8px] font-bold"
                style={isRoot
                  ? { backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }
                  : isAccelerator
                  ? { backgroundColor: '#E07840', color: 'white' }
                  : { backgroundColor: '#F0EBE0', color: '#9B9589' }}>
                Поз. {gPos}
              </span>
            )}
          </div>
          <div className="mt-0.5">
            {isAccelerator
              ? <span className="text-[8px] font-bold" style={{ color: 'rgba(224,120,64,0.7)' }}>виртуальный · слабая ветка</span>
              : <StatusBadge status={node?.stageStatus ?? node?.status} />
            }
          </div>
        </div>
      </div>

      {children.length > 0 && (
        <div
          className="ml-5 mt-2 mb-1 pl-4 border-l-2 border-dashed space-y-2"
          style={{ borderColor: LINE_COLORS[Math.min(depth, LINE_COLORS.length - 1)] }}
        >
          {children.map((child: any, i: number) => (
            <MobileTreeNode
              key={i}
              node={child}
              gPos={gPos === 0 ? i + 1 : gPos * 2 + i + 1}
              depth={depth + 1}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Segmented selector ───────────────────────────────────────────────────────

function SegmentedSelector({ label, value, options, onChange }: {
  label: string; value: number; options: number[]; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest shrink-0">{label}</span>
      <div className="flex items-center p-1 bg-[#F0EBE0] rounded-xl gap-0.5">
        {options.map((opt) => (
          <button key={opt} onClick={() => onChange(opt)}
            className="w-8 h-7 rounded-lg text-[11px] font-bold transition-all"
            style={value === opt ? { backgroundColor: '#1B2B20', color: 'white' } : { color: 'rgba(26,26,26,0.4)' }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Branch stats ─────────────────────────────────────────────────────────────

function BranchStatCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="flex-1 rounded-2xl border border-[#E5DDD0] bg-white p-5">
      <p className="text-[10px] font-bold text-[#9B9589] tracking-widest uppercase mb-1">{title}</p>
      <p className="text-2xl font-bold text-[#1A1A1A]">{value}</p>
      <p className="text-xs text-[#9B9589] mt-1">{sub}</p>
    </div>
  )
}

// ─── Stage 2 Race ─────────────────────────────────────────────────────────────

const RANK_MEDALS = ['🥇', '🥈', '🥉']

function Stage2RaceBlock({ level, stageStatus }: { level: number; stageStatus?: string }) {
  const { data, isLoading } = useGetStage2RaceQuery(level)
  const inner = data?.data
  const items: any[] = Array.isArray(inner)
    ? inner
    : Array.isArray(inner?.candidates)
      ? inner.candidates
      : Array.isArray(inner?.participants)
        ? inner.participants
        : Array.isArray(data)
          ? data
          : []
  const stage2Completed: boolean =
    stageStatus === 'COMPLETED' ||
    !!(inner?.stage2Completed ?? data?.stage2Completed ?? items.some((i: any) => i.stage2Completed))

  if (!isLoading && stage2Completed) return null
  if (isLoading && items.length === 0) return null

  return (
    <div className="bg-white border border-[#E5DDD0] rounded-3xl p-5 md:p-6 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg">🏁</span>
        <h3 className="font-bold text-[#1A1A1A] text-base">Гонка за позицию</h3>
        <span className="ml-auto text-[10px] font-bold text-[#E07840] bg-[#E07840]/10 px-2.5 py-1 rounded-full uppercase tracking-widest">
          Идёт
        </span>
      </div>

      {isLoading ? (
        <p className="text-center text-[#9B9589] text-xs font-bold animate-pulse py-4">Загрузка...</p>
      ) : (
        <div className="space-y-3">
          {items.map((item: any, idx: number) => {
            const filled: number = item.filled ?? 0
            const total: number = item.total ?? 6
            const pct = total > 0 ? Math.round((filled / total) * 100) : 0
            const isPartner: boolean = item.isFixedPartner
            const slotLabel = item.fixedPartnerSlot === 1 ? 'Левый партнёр' : item.fixedPartnerSlot === 2 ? 'Правый партнёр' : null

            return (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-base w-6 shrink-0 text-center">
                  {RANK_MEDALS[idx] ?? '  '}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <span className="text-sm font-bold text-[#1A1A1A] truncate">{item.name ?? item.initials}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-[#9B9589]">{filled}/{total}</span>
                      {isPartner && slotLabel && (
                        <span className="text-[9px] font-black tracking-widest uppercase text-[#4A7C5E] bg-[#EDF5F1] px-2 py-0.5 rounded-full whitespace-nowrap">
                          ✅ {slotLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-[#F0EBE0] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: isPartner ? '#4A7C5E' : '#E07840' }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TreePage() {
  const { t } = useTranslation()
  const { data: dashData } = useGetDashboardQuery(undefined)
  const { data: meData } = useGetMeQuery(undefined)

  const isFastStart = meData?.data?.registrationPlan === 'FAST_START'
  const LEVEL_OPTIONS = isFastStart ? [0, 1, 2, 3, 4] : [1, 2, 3, 4]

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [selectedStage, setSelectedStage] = useState<number | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const defaultLevel = isFastStart ? 0 : (dashData?.data?.currentLevel ?? 1)
  const currentLevel = selectedLevel ?? defaultLevel

  const stageOptions = (isFastStart && currentLevel === 1) ? [2, 3, 4] : [1, 2, 3, 4]
  const defaultStage = currentLevel === 0 ? 1 : (isFastStart && currentLevel === 1) ? 2 : (dashData?.data?.currentStage ?? 1)
  const currentStage = selectedStage ?? defaultStage

  const { data: treeData, isLoading, isFetching } = useGetMyTreeQuery({ level: currentLevel, stage: currentStage })
  const { data: branchesData } = useGetTreeBranchesQuery(undefined)

  const tree = treeData?.data
  const rootNode = tree?.root ?? null
  const branches = branchesData?.data
  const filled: number = tree?.progress?.filled ?? 0
  const total: number = tree?.progress?.total ?? (currentLevel === 0 ? 1 : 6)
  const fastStartNumber: number | null = tree?.fastStartNumber ?? meData?.data?.fastStartNumber ?? null

  const userCurrentLevel: number = meData?.data?.currentLevel ?? dashData?.data?.currentLevel ?? 1
  const userCurrentStage: number = meData?.data?.currentStage ?? dashData?.data?.currentStage ?? 1
  const stageNotStarted = currentLevel !== 0 && (
    currentLevel > userCurrentLevel ||
    (currentLevel === userCurrentLevel && currentStage > userCurrentStage)
  )

  return (
    <CabinetLayout title={t('dashboard.tree_title')}>
      {selectedUserId && (
        <MemberModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">{t('dashboard.tree_title')}</h2>
              {currentLevel === 0 && fastStartNumber != null && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-white"
                  style={{ backgroundColor: '#E07840' }}>
                  <Zap size={12} fill="currentColor" /> FAST START #{fastStartNumber}
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-[#9B9589] mt-1.5">
              {currentLevel === 0
                ? 'Быстрый Старт — пригласи 1 человека для перехода на Уровень 1'
                : `${t('common.level')} ${currentLevel} · ${t('common.step')} ${currentStage}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-start">
            <SegmentedSelector
              label={t('common.level')}
              value={currentLevel}
              options={LEVEL_OPTIONS}
              onChange={(v) => { setSelectedLevel(v); setSelectedStage(null) }}
            />
            {currentLevel !== 0 && (
              <SegmentedSelector
                label={t('common.step')}
                value={currentStage}
                options={stageOptions}
                onChange={setSelectedStage}
              />
            )}
          </div>
        </div>

        {/* Tree card */}
        <div className="bg-white border border-[#E5DDD0] rounded-3xl p-4 md:p-8 shadow-sm">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-[#1A1A1A] text-lg">
                {currentLevel === 0
                  ? 'Быстрый Старт · 0 Уровень'
                  : `${t('common.level')} ${currentLevel} · ${t('common.step')} ${currentStage}`}
              </h3>
              <p className="text-xs text-[#9B9589] mt-0.5">
                {currentLevel === 0
                  ? `Нужен ${total} реферал · приглашено ${filled}`
                  : `Заполнено ${filled} из ${total} позиций`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 self-start sm:self-auto">
              {currentLevel === 0 && filled >= total && total > 0 && (
                <span className="px-4 py-1.5 rounded-full bg-[#EDF5F1] text-[10px] font-bold text-[#4A7C5E] uppercase tracking-widest">
                  ● Готов к переходу
                </span>
              )}
              {tree?.accelerator?.active && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  style={{ backgroundColor: 'rgba(224,120,64,0.12)', color: '#E07840' }}>
                  <Zap size={11} fill="currentColor" /> Ускоритель активен
                </span>
              )}
              {tree?.stageStatus === 'COMPLETED' && currentLevel !== 0 && (
                <span className="px-4 py-1.5 rounded-full bg-[#EDF5F1] text-[10px] font-bold text-[#4A7C5E] uppercase tracking-widest">
                  ● {t('dashboard.stage_completed')}
                </span>
              )}
            </div>
          </div>

          {/* Progress */}
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

          {currentLevel !== 0 && currentStage === 2 && (
            <Stage2RaceBlock level={currentLevel} stageStatus={tree?.stageStatus} />
          )}

          {(isLoading || isFetching) && (
            <div className="flex items-center justify-center py-16">
              <p className="text-[#9B9589] font-bold animate-pulse uppercase tracking-widest text-sm">ЗАГРУЗКА...</p>
            </div>
          )}

          {!isLoading && !isFetching && stageNotStarted && (
            <div className="flex flex-col items-center gap-4 py-14">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: '#F0EBE0' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C5BDB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-bold text-[#1A1A1A] text-base">Этап ещё не начат</p>
                <p className="text-sm text-[#9B9589] mt-1">Дерево Этапа {currentStage} появится, когда вы до него дойдёте</p>
              </div>
            </div>
          )}

          {!isLoading && !isFetching && !stageNotStarted && !rootNode && (
            <p className="text-center text-[#9B9589] py-12 font-medium">Нет данных для этого уровня и этапа</p>
          )}

          {!isLoading && !isFetching && !stageNotStarted && rootNode && (
            <>
              {/* Mobile: card list */}
              <div className="md:hidden bg-[#F8F5F0] rounded-2xl p-4">
                <MobileTreeNode node={rootNode} gPos={0} depth={0} onNodeClick={setSelectedUserId} />
              </div>

              {/* Desktop: graphical canvas */}
              <div className="hidden md:block bg-[#F8F5F0] rounded-2xl overflow-x-auto">
                <div className="py-8 px-6 flex justify-center" style={{ minWidth: 'max-content' }}>
                  <TreeCanvas rootNode={rootNode} level={currentLevel} stage={currentStage} onNodeClick={setSelectedUserId} />
                </div>
              </div>
            </>
          )}
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
