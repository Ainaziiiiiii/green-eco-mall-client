import React, { useState } from 'react'
import { CabinetLayout } from '#widgets/CabinetLayout'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useGetBonusSummaryQuery, useGetBonusesQuery } from '../api/bonusesApi'

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, dark }: { label: string; value: string; sub?: string; dark?: boolean }) {
  return (
    <div
      className={cn('rounded-2xl p-5 shadow-sm', dark ? '' : 'border border-[#E0D9CF] bg-white')}
      style={dark ? { backgroundColor: '#2C4A3E' } : {}}
    >
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em]"
        style={{ color: dark ? 'rgba(255,255,255,0.5)' : '#9B9589' }}>
        {label}
      </p>
      <p className="text-2xl font-bold tracking-tight" style={{ color: dark ? 'white' : '#1A1A1A' }}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs font-medium" style={{ color: dark ? 'rgba(255,255,255,0.45)' : '#9B9589' }}>{sub}</p>}
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: 'Ожидает',      cls: 'border border-[#E07840] text-[#E07840]' },
  CONFIRMED: { label: 'Подтверждён',  cls: 'bg-[#EDF5F1] text-[#4A7C5E]' },
  PAID:      { label: 'Выплачен',     cls: 'bg-[#2C4A3E] text-white' },
}

const TYPE_MAP: Record<string, string> = {
  REFERRAL_DIRECT:   'Прямой реферал',
  REFERRAL_INDIRECT: 'Косвенный реферал',
  STAGE:             'Завершение этапа',
  DIVIDEND:          'Дивиденды',
}

const FILTER_TYPES = ['', 'REFERRAL_DIRECT', 'REFERRAL_INDIRECT', 'STAGE', 'DIVIDEND']
const FILTER_STATUSES = ['', 'PENDING', 'CONFIRMED', 'PAID']

export default function BonusesPage() {
  const { t } = useTranslation()
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(0)

  const { data: summary, isLoading: summaryLoading } = useGetBonusSummaryQuery(undefined)
  const { data: bonuses, isLoading: bonusesLoading } = useGetBonusesQuery({
    type: filterType || undefined,
    status: filterStatus || undefined,
    page,
    limit: 20,
  })

  const s = summary?.data
  const list: any[] = bonuses?.data?.content ?? []
  const totalPages: number = bonuses?.data?.totalPages ?? 0

  return (
    <CabinetLayout title="Бонусы">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Бонусы</h2>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Доступно"
            value={summaryLoading ? '...' : `${(s?.available ?? 0).toLocaleString('ru-RU')} сом`}
            dark
          />
          <StatCard
            label="Ожидает"
            value={summaryLoading ? '...' : `${(s?.pending ?? 0).toLocaleString('ru-RU')} сом`}
            sub="Подтвердятся при выполнении условий"
          />
          <StatCard
            label="Подтверждено"
            value={summaryLoading ? '...' : `${(s?.confirmed ?? 0).toLocaleString('ru-RU')} сом`}
          />
          <StatCard
            label="Всего заработано"
            value={summaryLoading ? '...' : `${(s?.total ?? 0).toLocaleString('ru-RU')} сом`}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">Тип:</span>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(0) }}
              className="h-9 px-3 rounded-xl border border-[#E5DDD0] bg-white text-xs font-bold text-[#1A1A1A] focus:outline-none focus:border-[#1B2B20]"
            >
              <option value="">Все типы</option>
              {FILTER_TYPES.slice(1).map((t) => (
                <option key={t} value={t}>{TYPE_MAP[t]}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">Статус:</span>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(0) }}
              className="h-9 px-3 rounded-xl border border-[#E5DDD0] bg-white text-xs font-bold text-[#1A1A1A] focus:outline-none focus:border-[#1B2B20]"
            >
              <option value="">Все статусы</option>
              {FILTER_STATUSES.slice(1).map((s) => (
                <option key={s} value={s}>{STATUS_MAP[s]?.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E5DDD0] rounded-3xl overflow-hidden shadow-sm">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[140px_0.7fr_1fr_100px_150px] gap-4 p-4 border-b border-[#E5DDD0] bg-[#F1EDE4]">
            {['ДАТА', 'ТИП', 'ОПИСАНИЕ', 'СУММА', 'СТАТУС'].map((h) => (
              <span key={h} className="text-[9px] font-bold text-[#9B9589] uppercase tracking-widest">{h}</span>
            ))}
          </div>

          {bonusesLoading && (
            <div className="flex items-center justify-center h-40">
              <p className="text-[#9B9589] font-bold animate-pulse uppercase tracking-widest">Загрузка...</p>
            </div>
          )}

          {!bonusesLoading && list.length === 0 && (
            <div className="flex items-center justify-center h-40">
              <p className="text-[#9B9589] text-sm">Бонусов нет</p>
            </div>
          )}

          {list.map((bonus: any) => {
            const st = STATUS_MAP[bonus.status] ?? STATUS_MAP.PENDING
            return (
              <div key={bonus.id}>
                {/* Desktop */}
                <div className="hidden md:grid grid-cols-[140px_0.7fr_1fr_100px_150px] gap-4 items-center p-4 border-b border-[#F0EBE0] last:border-0 hover:bg-[#FAFAF8]">
                  <span className="text-xs text-[#9B9589]">
                    {new Date(bonus.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </span>
                  <span className="text-xs font-bold text-[#1A1A1A]">{TYPE_MAP[bonus.type] ?? bonus.type}</span>
                  <span className="text-xs text-[#9B9589] truncate">
                    {bonus.description || (bonus.fromUserName ? `от ${bonus.fromUserName}` : '—')}
                  </span>
                  <span className="text-xs font-black text-[#1A1A1A] whitespace-nowrap">
                    {bonus.amount.toLocaleString('ru-RU')} сом
                  </span>
                  <span className={cn('inline-block rounded-full px-3 py-1 text-[11px] font-black tracking-wide whitespace-nowrap', st.cls)}>
                    ● {st.label}
                  </span>
                </div>

                {/* Mobile */}
                <div className="md:hidden p-4 border-b border-[#F0EBE0] last:border-0">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">
                      {new Date(bonus.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                    </span>
                    <span className={cn('inline-block rounded-full px-2 py-0.5 text-[8px] font-black tracking-widest', st.cls)}>
                      ● {st.label.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[13px] font-bold text-[#1A1A1A] mb-0.5">{TYPE_MAP[bonus.type] ?? bonus.type}</p>
                  {(bonus.description || bonus.fromUserName) && (
                    <p className="text-[11px] text-[#9B9589] mb-1">
                      {bonus.description || `от ${bonus.fromUserName}`}
                    </p>
                  )}
                  <p className="text-sm font-black text-[#2C4A3E]">{bonus.amount.toLocaleString('ru-RU')} сом</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-xl border border-[#E5DDD0] text-[11px] font-bold text-[#9B9589] hover:bg-[#F8F5F0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors uppercase tracking-widest"
            >
              ← Назад
            </button>
            <span className="flex items-center text-[11px] font-bold text-[#9B9589] uppercase tracking-widest px-4">
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-xl border border-[#E5DDD0] text-[11px] font-bold text-[#9B9589] hover:bg-[#F8F5F0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors uppercase tracking-widest"
            >
              Далее →
            </button>
          </div>
        )}
      </div>
    </CabinetLayout>
  )
}
