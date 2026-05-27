import React, { useState } from 'react'
import { Smartphone, Monitor, Tablet, Shield } from 'lucide-react'
import { CabinetLayout } from '#widgets/CabinetLayout'
import { useGetLoginHistoryQuery } from '../api/authApi'

function parseDevice(ua: string): { label: string; icon: React.ReactNode } {
  if (/iPhone/i.test(ua)) return { label: 'iPhone (iOS)', icon: <Smartphone size={16} /> }
  if (/iPad/i.test(ua)) return { label: 'iPad (iOS)', icon: <Tablet size={16} /> }
  if (/Android/i.test(ua)) return { label: 'Android', icon: <Smartphone size={16} /> }
  return { label: 'Браузер', icon: <Monitor size={16} /> }
}

function formatLoginDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function SecurityPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useGetLoginHistoryQuery({ page, size: 20 })

  const entries: any[] = data?.data?.content ?? []
  const totalPages: number = data?.data?.totalPages ?? 0

  return (
    <CabinetLayout title="Безопасность">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Безопасность</h2>
          <p className="text-sm text-[#9B9589] mt-1">История входов в ваш аккаунт.</p>
        </div>

        <div className="rounded-3xl border border-[#E5DDD0] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-[#F0EBE0]"
            style={{ backgroundColor: '#F8F5F0' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#1B2B20' }}>
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#1A1A1A]">История входов</p>
              <p className="text-[10px] text-[#9B9589] font-medium">Все устройства, с которых выполнялся вход</p>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center h-40">
              <p className="text-[#9B9589] font-bold animate-pulse uppercase tracking-widest text-[11px]">Загрузка...</p>
            </div>
          )}

          {!isLoading && entries.length === 0 && (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm text-[#9B9589]">Нет данных</p>
            </div>
          )}

          {entries.map((e: any, i: number) => {
            const device = parseDevice(e.userAgent ?? '')
            const isFirst = i === 0
            return (
              <div key={e.id}
                className="flex items-start gap-4 px-5 py-4 border-b border-[#F0EBE0] last:border-0"
                style={{ backgroundColor: isFirst ? '#F0FDF4' : 'white' }}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: isFirst ? '#2C4A3E' : '#F8F5F0', color: isFirst ? 'white' : '#9B9589' }}>
                  {device.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-bold text-[#1A1A1A]">{device.label}</span>
                    {isFirst && (
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#2C4A3E', color: 'white' }}>
                        Последний
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#9B9589] mt-0.5">
                    {e.phone} · {e.ipAddress}
                  </p>
                  <p className="text-[11px] text-[#C5BDB3] mt-0.5">{formatLoginDate(e.createdAt)}</p>
                </div>
              </div>
            )
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-xl border border-[#E5DDD0] text-[11px] font-bold text-[#9B9589] hover:bg-[#F8F5F0] disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest"
            >
              ← Назад
            </button>
            <span className="flex items-center text-[11px] font-bold text-[#9B9589] uppercase tracking-widest px-4">
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-xl border border-[#E5DDD0] text-[11px] font-bold text-[#9B9589] hover:bg-[#F8F5F0] disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest"
            >
              Далее →
            </button>
          </div>
        )}
      </div>
    </CabinetLayout>
  )
}
