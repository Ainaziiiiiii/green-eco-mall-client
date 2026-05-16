import React, { useState } from 'react'
import { Copy, Check, AlertCircle, Zap } from 'lucide-react'
import { CabinetLayout } from '#widgets/CabinetLayout'
import { useTranslation } from 'react-i18next'
import { useGetMeQuery } from '../api/authApi'
import { useUpdateProfileMutation } from '../api/userApi'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-4 border-b border-[#F0EBE0] last:border-0">
      <span className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest sm:w-44 shrink-0">{label}</span>
      <span className="text-sm font-bold text-[#1A1A1A]">{value || '—'}</span>
    </div>
  )
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-4 border-b border-[#F0EBE0] last:border-0">
      <span className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest sm:w-44 shrink-0">{label}</span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-sm font-bold text-[#1A1A1A] truncate">{value || '—'}</span>
        {value && (
          <button
            onClick={copy}
            className="shrink-0 p-1.5 rounded-lg bg-[#F8F5F0] hover:bg-[#EDE8DA] transition-colors"
          >
            {copied ? <Check size={14} className="text-[#4A7C5E]" /> : <Copy size={14} className="text-[#9B9589]" />}
          </button>
        )}
      </div>
    </div>
  )
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Активен', color: '#4A7C5E' },
  PENDING: { label: 'Ожидает оплаты', color: '#E07840' },
  BLOCKED: { label: 'Заблокирован', color: '#D04040' },
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const { data: meData, isLoading } = useGetMeQuery(undefined)
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation()

  const [editing, setEditing] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const user = meData?.data

  const handleEdit = () => {
    setFirstName(user?.firstName ?? '')
    setLastName(user?.lastName ?? '')
    setNewPassword('')
    setError('')
    setEditing(true)
  }

  const handleSave = async () => {
    const body: any = {}
    if (firstName !== user?.firstName) body.firstName = firstName
    if (lastName !== user?.lastName) body.lastName = lastName
    if (newPassword) body.password = newPassword
    if (!Object.keys(body).length) {
      setEditing(false)
      return
    }
    try {
      await updateProfile(body).unwrap()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      setEditing(false)
    } catch (err: any) {
      setError(err?.data?.message ?? 'Ошибка сохранения')
    }
  }

  if (isLoading) {
    return (
      <CabinetLayout title={t('common.profile')}>
        <div className="flex items-center justify-center h-64">
          <p className="text-[#9B9589] font-bold animate-pulse uppercase tracking-widest">Загрузка...</p>
        </div>
      </CabinetLayout>
    )
  }

  const status = STATUS_LABELS[user?.accountStatus ?? ''] ?? { label: user?.accountStatus ?? '—', color: '#9B9589' }

  return (
    <CabinetLayout title={t('common.profile')}>
      <div className="space-y-6 max-w-2xl">
        {/* Header card */}
        <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-[#1B2B20] flex items-center justify-center text-white text-lg font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1A1A1A]">
                  {user?.firstName} {user?.lastName}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${status.color}15`, color: status.color }}
                  >
                    ● {status.label}
                  </span>
                  <span className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">
                    Уровень {user?.currentLevel} · Этап {user?.currentStage}
                  </span>
                  {user?.acceleratorAssisted && (user?.currentStage ?? 0) >= 2 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(224,120,64,0.12)', color: '#E07840' }}>
                      <Zap size={9} fill="currentColor" /> Помог ускоритель
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={editing ? handleSave : handleEdit}
              disabled={isSaving}
              className="shrink-0 px-4 py-2 rounded-xl bg-[#1B2B20] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#2C4A3E] transition-colors disabled:opacity-50"
            >
              {isSaving ? '...' : editing ? (saved ? '✓' : 'Сохранить') : 'Изменить'}
            </button>
          </div>
        </div>

        {/* Personal info */}
        <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest mb-2">Личные данные</h3>

          {editing ? (
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">Имя</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-12 px-4 bg-[#F8F5F0] border border-[#E5DDD0] rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:border-[#1B2B20]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">Фамилия</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-12 px-4 bg-[#F8F5F0] border border-[#E5DDD0] rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:border-[#1B2B20]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">Новый пароль (оставьте пустым для сохранения старого)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="........"
                  className="w-full h-12 px-4 bg-[#F8F5F0] border border-[#E5DDD0] rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:border-[#1B2B20]"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
              <button
                onClick={() => setEditing(false)}
                className="w-full py-2 text-[11px] font-bold text-[#9B9589] uppercase tracking-widest hover:text-[#1A1A1A] transition-colors"
              >
                Отмена
              </button>
            </div>
          ) : (
            <div>
              <InfoRow label="Имя" value={user?.firstName ?? ''} />
              <InfoRow label="Фамилия" value={user?.lastName ?? ''} />
              <InfoRow label="Телефон" value={user?.phone ?? ''} />
              <InfoRow label="Паспорт" value={user?.passportNumber ?? ''} />
              <InfoRow
                label="Дата регистрации"
                value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : '—'}
              />
              <InfoRow
                label="Дата активации"
                value={user?.activatedAt ? new Date(user.activatedAt).toLocaleDateString('ru-RU') : 'Не активирован'}
              />
            </div>
          )}
        </div>

        {/* Referral */}
        <div className="rounded-3xl border border-[#E5DDD0] bg-white p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest mb-2">Реферальные данные</h3>
          <CopyRow label="Реферальный код" value={user?.referralCode ?? ''} />
          <CopyRow label="Реферальная ссылка" value={user?.referralLink ?? ''} />
          {user?.inviterName && <InfoRow label="Пригласил" value={user.inviterName} />}
        </div>

        {/* Balance */}
        <div className="rounded-3xl p-6 text-white shadow-xl shadow-black/10" style={{ backgroundColor: '#1B2B20' }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-1">Доступный баланс</p>
          <p className="text-4xl font-bold tracking-tight">
            {(user?.balance ?? 0).toLocaleString('ru-RU')}{' '}
            <span className="text-xl font-semibold text-white/50">{t('common.currency')}</span>
          </p>
        </div>
      </div>
    </CabinetLayout>
  )
}
