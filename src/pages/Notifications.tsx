import React from 'react'
import { Bell, CheckCheck, Users, Gift, TrendingUp, ArrowUpRight, Zap, CreditCard } from 'lucide-react'
import { CabinetLayout } from '#widgets/CabinetLayout'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '../api/userApi'

const TYPE_META: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  NEW_MEMBER:         { icon: <Users size={16} />,      color: '#2C4A3E', bg: '#EDF5F1' },
  BONUS_RECEIVED:     { icon: <Gift size={16} />,       color: '#E07840', bg: '#FEF3EC' },
  BONUS_CONFIRMED:    { icon: <Gift size={16} />,       color: '#4A7C5E', bg: '#EDF5F1' },
  STAGE_COMPLETE:     { icon: <TrendingUp size={16} />, color: '#3A7C8E', bg: '#E8F4F8' },
  LEVEL_UP:           { icon: <ArrowUpRight size={16} />, color: '#7C6A3A', bg: '#F8F3E8' },
  ACCELERATOR_PLACED: { icon: <Zap size={16} />,        color: '#8E3A7A', bg: '#F8E8F5' },
  WITHDRAWAL_STATUS:  { icon: <CreditCard size={16} />, color: '#9B9589', bg: '#F5F3F0' },
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffH = (now.getTime() - d.getTime()) / 3600000
  if (diffH < 24) return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  if (diffH < 48) return 'вчера'
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

export default function NotificationsPage() {
  const { t } = useTranslation()
  const { data, isLoading, refetch } = useGetNotificationsQuery(undefined)
  const [markRead] = useMarkNotificationReadMutation()
  const [markAll] = useMarkAllNotificationsReadMutation()

  const notifications: any[] = data?.data ?? []
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAll = async () => {
    await markAll(undefined).unwrap()
    refetch()
  }

  const handleMarkOne = async (id: string) => {
    await markRead(id).unwrap()
    refetch()
  }

  return (
    <CabinetLayout title={t('common.notifications')}>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A]">{t('common.notifications')}</h2>
            {unreadCount > 0 && (
              <p className="text-[11px] font-bold text-[#E07840] mt-0.5 uppercase tracking-widest">
                {unreadCount} непрочитанных
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E5DDD0] text-[11px] font-bold text-[#9B9589] hover:bg-[#F8F5F0] transition-colors uppercase tracking-widest"
            >
              <CheckCheck size={14} />
              Прочитать все
            </button>
          )}
        </div>

        {/* List */}
        <div className="rounded-3xl border border-[#E5DDD0] bg-white shadow-sm overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center h-40">
              <p className="text-[#9B9589] font-bold animate-pulse uppercase tracking-widest">Загрузка...</p>
            </div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <Bell size={32} className="text-[#E5DDD0]" />
              <p className="text-[#9B9589] text-sm font-bold uppercase tracking-widest">Уведомлений нет</p>
            </div>
          )}

          {notifications.map((n: any, i: number) => {
            const meta = TYPE_META[n.type] ?? TYPE_META.WITHDRAWAL_STATUS
            return (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkOne(n.id)}
                className={cn(
                  'flex items-start gap-4 p-5 border-b border-[#F0EBE0] last:border-0 transition-colors',
                  !n.isRead ? 'bg-[#FAFAF8] cursor-pointer hover:bg-[#F8F5F0]' : ''
                )}
              >
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: meta.bg, color: meta.color }}
                >
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm font-bold text-[#1A1A1A]', !n.isRead && 'font-black')}>
                      {n.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-medium text-[#9B9589]">{formatDate(n.createdAt)}</span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#E07840] shrink-0" />
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-[#9B9589] mt-0.5 leading-relaxed">{n.body}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </CabinetLayout>
  )
}
