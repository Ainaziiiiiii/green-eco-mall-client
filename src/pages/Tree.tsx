import React from 'react'
import { CheckCircle2, Circle, AlertCircle, Zap } from 'lucide-react'
import { CabinetLayout } from '#widgets/CabinetLayout'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useGetMyTreeQuery, useGetTreeBranchesQuery } from '../api/treeApi'

// ─── Shared Components ────────────────────────────────────────────────────────

const AVATAR_COLORS: Record<string, string> = {
  АО: '#2C4A3E',
  АК: '#3A7C8E',
  ГМ: '#7C6A3A',
  БТ: '#3A5C8E',
  НЖ: '#2A2A2A',
  ЗА: '#8E7A3A',
  ТС: '#3A8E6A',
}

type NodeStatus = 'done' | 'active' | 'waiting' | 'accelerator'

function NodeStatusBadge({ status }: { status: NodeStatus }) {
  const { t } = useTranslation();
  if (status === 'done')
    return (
      <span className="inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold border border-[#4A7C5E] text-[#4A7C5E]">
        ● {t('common.completed').toUpperCase()}
      </span>
    )
  if (status === 'active')
    return (
      <span className="inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold border border-[#E07840] text-[#E07840]">
        ● {t('common.active').toUpperCase()}
      </span>
    )
  return (
    <span className="inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold border border-[#C4BFB8] text-[#9B9589]">
      ● {t('common.waiting').toUpperCase()}
    </span>
  )
}

const mapStatus = (apiStatus: string): NodeStatus => {
  switch (apiStatus) {
    case 'COMPLETED': return 'done';
    case 'IN_PROGRESS': return 'active';
    default: return 'waiting';
  }
}

// ─── Tree Nodes ───────────────────────────────────────────────────────────────

function TreeRootNode({ name, initials, level, stage }: { name: string, initials: string, level: number, stage: number }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl p-3 shadow-md bg-[#1B2B20]" style={{ width: 170 }}>
      <div className="mb-2">
        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold bg-[#E07840]/20 text-[#E07840]">
          {t('dashboard.legend_you').toUpperCase()} · ROOT
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white bg-[#2C4A3E]">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="text-[10px] text-white/45">{t('common.level')} {level} · {t('common.step')} {stage}</p>
        </div>
      </div>
    </div>
  )
}

function TreeMemberNode({
  pos,
  initials,
  name,
  progress,
  date,
  status,
  isAccelerator,
}: {
  pos: number
  initials: string
  name: string
  progress?: string
  date?: string
  status: NodeStatus
  isAccelerator?: boolean
}) {
  const { t } = useTranslation();
  if (isAccelerator) return <AcceleratorNode pos={pos} />;

  return (
    <div className="rounded-xl border border-[#E5DDD0] bg-white p-3 shadow-sm" style={{ width: 160 }}>
      <div className="mb-2">
        <span className="rounded bg-[#1A1A1A] px-1.5 py-0.5 text-[9px] font-bold text-white">
          Поз. {pos}
        </span>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ backgroundColor: AVATAR_COLORS[initials] ?? '#9B9589' }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1A1A1A] truncate">{name}</p>
          <p className="text-[10px] text-[#9B9589]">
            {progress || '...'} {date ? `· ${date}` : ''}
          </p>
        </div>
      </div>
      <NodeStatusBadge status={status} />
    </div>
  )
}

function AcceleratorNode({ pos }: { pos: number }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border-2 border-dashed border-[#E07840]/40 bg-[#FEF3EC]/50 p-3" style={{ width: 160 }}>
      <div className="mb-2">
        <span className="rounded bg-[#E07840] px-1.5 py-0.5 text-[9px] font-bold text-white tracking-wide">
          Поз. {pos}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-[#E07840]/30 text-[#E07840]">
          <Zap size={16} fill="currentColor" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#E07840]">{t('dashboard.legend_accelerator')}</p>
          <p className="text-[9px] text-[#E07840]/60 font-medium">виртуальный · слабая ветка</p>
        </div>
      </div>
    </div>
  )
}

// ─── Bottom Stats Cards ───────────────────────────────────────────────────────

function BranchStatCard({ title, value, sub }: { title: string, value: string, sub: string }) {
  return (
    <div className="flex-1 rounded-2xl border border-[#E5DDD0] bg-white p-5">
      <p className="text-[10px] font-bold text-[#9B9589] tracking-widest uppercase mb-1">{title}</p>
      <p className="text-2xl font-bold text-[#1A1A1A]">{value}</p>
      <p className="text-xs text-[#9B9589] mt-1">{sub}</p>
    </div>
  )
}

function AcceleratorInfoCard({ pos }: { pos: number }) {
  return (
    <div className="flex-1 rounded-2xl bg-[#FEF3EC] p-5 border border-[#E07840]/20">
      <p className="text-[10px] font-bold text-[#E07840] tracking-widest uppercase mb-1">УСКОРИТЕЛЬ</p>
      <p className="text-base font-bold text-[#1A1A1A]">1 размещён · Поз. {pos}</p>
      <p className="text-xs text-[#9B9589] mt-1">Виртуальный партнёр для выравнивания веток</p>
    </div>
  )
}

function TreeVerticalItem({
  initials,
  name,
  pos,
  status,
  isLast = false,
  isRoot = false,
  isAccelerator = false,
  children,
}: {
  initials?: string
  name: string
  pos: number | string
  status?: NodeStatus
  isLast?: boolean
  isRoot?: boolean
  isAccelerator?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="relative">
      {!isRoot && (
        <div
          className="absolute -left-4 top-0 h-8 w-px bg-[#D4CFC4]"
          style={{ height: children ? '100%' : '20px' }}
        />
      )}
      <div className="relative flex items-center gap-3 py-2.5">
        {!isRoot && <div className="absolute -left-4 top-[22px] h-px w-4 bg-[#D4CFC4]" />}
        
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm",
            isRoot && "h-11 w-11 text-xs",
            isAccelerator && "bg-[#FEF3EC] border border-[#E07840]/30 text-[#E07840]"
          )}
          style={{ backgroundColor: !isAccelerator ? (AVATAR_COLORS[initials || ''] ?? '#1B2B20') : undefined }}
        >
          {isAccelerator ? <Zap size={14} fill="currentColor" /> : initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className={cn("text-sm font-bold truncate", isAccelerator ? "text-[#E07840]" : "text-[#1A1A1A]")}>
              {name}
            </span>
            <span className={cn(
              "shrink-0 rounded px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider",
              isAccelerator ? "bg-[#E07840] text-white" : "bg-[#F0EBE0] text-[#9B9589]"
            )}>
              Поз. {pos}
            </span>
          </div>
          <div className="mt-0.5">
            {status && <NodeStatusBadge status={status} />}
            {isAccelerator && <span className="text-[9px] font-bold text-[#E07840]/70 uppercase">виртуальный</span>}
          </div>
        </div>
      </div>
      {children && <div className="ml-10 space-y-1">{children}</div>}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TreePage() {
  const { t } = useTranslation();
  const { data: treeData, isLoading } = useGetMyTreeQuery({ level: 1, stage: 1 });
  const { data: branchesData } = useGetTreeBranchesQuery(undefined);

  if (isLoading) return <CabinetLayout title={t('dashboard.tree_title')}><div className="flex items-center justify-center h-64"><p className="text-[#9B9589] font-bold animate-pulse">ЗАГРУЗКА...</p></div></CabinetLayout>;

  const tree = treeData?.data;
  const branches = branchesData?.data;

  return (
    <CabinetLayout title={t('dashboard.tree_title')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">{t('dashboard.tree_title')}</h2>
            <p className="text-xs md:text-sm text-[#9B9589] mt-1.5 max-w-xl leading-relaxed">
              Дерево из 6 основных позиций для текущего этапа.
            </p>
          </div>
          <div className="flex self-start sm:self-auto items-center gap-3 px-4 py-2 bg-white border border-[#E5DDD0] rounded-xl text-xs md:text-sm font-bold text-[#1A1A1A] shadow-sm">
            <span className="text-[#9B9589] font-medium mr-1 uppercase tracking-widest text-[10px]">{t('common.level')}</span>
            {tree?.currentLevel || 1} · {t('common.step')} {tree?.currentStage || 1}
          </div>
        </div>

        {/* Tree Container */}
        <div className="bg-white border border-[#E5DDD0] rounded-3xl p-4 md:p-8 relative overflow-hidden shadow-sm">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
               <h3 className="font-bold text-[#1A1A1A] text-lg">{t('common.level')} {tree?.currentLevel || 1} · {t('common.step')} {tree?.currentStage || 1} — Incubator</h3>
               {tree?.accelerator?.active && (
                 <span className="text-[10px] md:text-xs text-[#9B9589] font-bold bg-[#F8F5F0] px-2 py-0.5 rounded uppercase tracking-wider">
                   {tree?.progress?.filled} ЛЮДЕЙ + 1 УСКОРИТЕЛЬ
                 </span>
               )}
             </div>
             {tree?.stageStatus === 'COMPLETED' && (
               <span className="self-start sm:self-auto px-4 py-1.5 rounded-full bg-[#EDF5F1] text-[10px] font-bold text-[#4A7C5E] uppercase tracking-widest">● {t('dashboard.stage_completed')}</span>
             )}
          </div>

          <div className="bg-[#F8F5F0] rounded-2xl overflow-hidden p-8 flex justify-center">
             {/* Dynamic content */}
             <div className="overflow-x-auto w-full flex justify-center py-8">
                {tree?.root && (
                  <div className="flex flex-col items-center min-w-[600px]">
                    <div className="mb-12">
                      <TreeRootNode name={tree.root.name} initials={tree.root.initials} level={tree.currentLevel} stage={tree.currentStage} />
                    </div>
                    {/* Simplified 7-node visual layout */}
                    <div className="grid grid-cols-2 gap-x-32 relative">
                      {/* Lines */}
                      <svg className="absolute inset-0 pointer-events-none -top-12 h-[calc(100%+48px)] w-full" preserveAspectRatio="none">
                        <g stroke="#D4CFC4" strokeWidth="1.5" strokeDasharray="5 4" fill="none" opacity="0.6">
                          <line x1="50%" y1="0" x2="25%" y2="40" />
                          <line x1="50%" y1="0" x2="75%" y2="40" />
                          
                          <line x1="25%" y1="120" x2="10%" y2="160" />
                          <line x1="25%" y1="120" x2="40%" y2="160" />
                          
                          <line x1="75%" y1="120" x2="60%" y2="160" />
                          <line x1="75%" y1="120" x2="90%" y2="160" />
                        </g>
                      </svg>

                      {tree.root.children?.map((child: any) => (
                        <div key={child.position} className="flex flex-col items-center">
                           <TreeMemberNode 
                              pos={child.position} 
                              initials={child.initials} 
                              name={child.name} 
                              status={mapStatus(child.stageStatus)} 
                              isAccelerator={child.isAccelerator}
                            />
                            <div className="mt-20 flex gap-12">
                              {child.children?.map((subChild: any) => (
                                <TreeMemberNode 
                                  key={subChild.position}
                                  pos={subChild.position} 
                                  initials={subChild.initials} 
                                  name={subChild.name} 
                                  status={mapStatus(subChild.stageStatus)} 
                                  isAccelerator={subChild.isAccelerator}
                                />
                              ))}
                            </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!tree?.root && <p className="text-[#9B9589]">Нет данных дерева</p>}
             </div>
          </div>
        </div>

      {/* Footer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <BranchStatCard 
            title={`ЛЕВАЯ ВЕТКА`} 
            value={`${branches?.left?.size || 0} чел.`} 
            sub={branches?.left?.members?.[0]?.name ? `${branches.left.members[0].name} · ${branches.left.size} вглубь` : ''} 
          />
          <BranchStatCard 
            title={`ПРАВАЯ ВЕТКА`} 
            value={`${branches?.right?.size || 0} чел.`} 
            sub={branches?.right?.members?.[0]?.name ? `${branches.right.members[0].name} · ${branches.right.size} вглубь` : ''} 
          />
          {tree?.accelerator?.active && <AcceleratorInfoCard pos={tree.accelerator.position} />}
        </div>
      </div>
    </CabinetLayout>
  )
}
