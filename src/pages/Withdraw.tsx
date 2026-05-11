import React, { useState } from 'react'
import { Info, CreditCard, Smartphone, Building2, AlertCircle } from 'lucide-react'
import { CabinetLayout } from '#widgets/CabinetLayout'
import { cn } from '@/lib/utils'
import { useGetMeQuery } from '../api/authApi'
import { useGetWithdrawalsQuery, useCreateWithdrawalMutation } from '../api/withdrawalsApi'

// ─── Types ────────────────────────────────────────────────────────────────────

type WithdrawMethod = 'BANK_CARD' | 'PHONE_TRANSFER'

const METHOD_CONFIG: Record<WithdrawMethod, { icon: React.ReactNode; label: string; placeholder: string }> = {
  BANK_CARD:      { icon: <CreditCard size={18} />,  label: 'Банковская карта', placeholder: '0000 0000 0000 0000' },
  PHONE_TRANSFER: { icon: <Smartphone size={18} />,  label: 'Перевод на телефон', placeholder: '+996 XXX XX XX XX' },
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  APPROVED: { bg: '#EDF5F1', text: '#4A7C5E', label: 'ОДОБРЕН' },
  REJECTED: { bg: '#FEECEC', text: '#E04040', label: 'ОТКЛОНЁН' },
  PENDING:  { bg: '#FEF3EC', text: '#E07840', label: 'В ОЖИДАНИИ' },
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WithdrawPage() {
  const { data: meData } = useGetMeQuery(undefined)
  const { data: withdrawalsData, isLoading: historyLoading } = useGetWithdrawalsQuery({ page: 0, limit: 20 })
  const [createWithdrawal, { isLoading: submitting }] = useCreateWithdrawalMutation()

  const balance: number = meData?.data?.balance ?? 0
  const history: any[] = withdrawalsData?.data?.content ?? withdrawalsData?.data ?? []

  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<WithdrawMethod>('BANK_CARD')
  const [requisite, setRequisite] = useState('')
  const [bankName, setBankName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSetAll = () => setAmount(String(balance))

  const handleSubmit = async () => {
    setError('')
    const num = parseFloat(amount.replace(/\s/g, ''))
    if (!num || num < 1000) { setError('Минимальная сумма — 1 000 сом'); return }
    if (num > balance)       { setError('Недостаточно средств на балансе'); return }
    if (!requisite.trim())   { setError('Укажите реквизиты'); return }
    if (!bankName.trim()) { setError('Укажите название банка'); return }

    try {
      const body: any = { amount: num, method, requisite: requisite.trim() }
      if (method === 'BANK_CARD') body.bankName = bankName.trim()
      await createWithdrawal(body).unwrap()
      setSuccess(true)
      setAmount('')
      setRequisite('')
      setBankName('')
      setTimeout(() => setSuccess(false), 4000)
    } catch (err: any) {
      setError(err?.data?.message ?? 'Ошибка при подаче заявки')
    }
  }

  const handleCancel = () => {
    setAmount('')
    setRequisite('')
    setBankName('')
    setError('')
    setSuccess(false)
  }

  return (
    <CabinetLayout title="Вывод средств">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Form */}
        <div className="flex-1 space-y-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Вывод средств</h2>
            <p className="text-sm text-[#9B9589] mt-1">
              Минимальная сумма — 1 000 сом. Заявки рассматриваются администратором в течение 24 часов.
            </p>
          </div>

          <div className="bg-white border border-[#E5DDD0] rounded-3xl p-5 md:p-8 shadow-sm">
            <h3 className="font-bold text-[#1A1A1A] mb-6">Новая заявка</h3>

            <div className="space-y-6">
              {/* Amount */}
              <div>
                <p className="text-[10px] font-bold text-[#9B9589] tracking-widest mb-3 uppercase">Сумма к выводу</p>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setError('') }}
                    placeholder="0"
                    className="w-full bg-[#F8F5F0] border-none rounded-2xl py-5 md:py-6 px-6 md:px-8 text-2xl md:text-4xl font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1B2B20]/10"
                  />
                  <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-4">
                    <span className="text-xs md:text-sm font-bold text-[#9B9589] uppercase tracking-widest">сом</span>
                    <button
                      onClick={handleSetAll}
                      className="text-[10px] md:text-[11px] font-bold text-[#1B2B20] hover:underline underline-offset-4 decoration-2"
                    >
                      Всё
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between px-2">
                  <p className="text-[10px] md:text-xs text-[#9B9589]">
                    Доступно: <span className="font-bold text-[#1A1A1A]">{balance.toLocaleString('ru-RU')} сом</span>
                  </p>
                  <p className="text-[10px] md:text-xs text-[#9B9589]">
                    Минимум: <span className="font-bold text-[#1A1A1A]">1 000 сом</span>
                  </p>
                </div>
              </div>

              {/* Method */}
              <div>
                <p className="text-[10px] font-bold text-[#9B9589] tracking-widest mb-3 uppercase">Способ получения</p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  {(Object.keys(METHOD_CONFIG) as WithdrawMethod[]).map((m) => {
                    const cfg = METHOD_CONFIG[m]
                    const active = method === m
                    return (
                      <button
                        key={m}
                        onClick={() => { setMethod(m); setRequisite(m === 'PHONE_TRANSFER' ? '+996' : ''); setError('') }}
                        className={cn(
                          'flex items-center gap-3 px-5 py-3 rounded-xl border transition-all w-full sm:w-auto',
                          active
                            ? 'bg-[#1B2B20] text-white border-[#1B2B20] shadow-md shadow-[#1B2B20]/10'
                            : 'border-[#E5DDD0] text-[#1A1A1A] hover:bg-[#F8F5F0]'
                        )}
                      >
                        {cfg.icon}
                        <span className="text-xs font-bold">{cfg.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Requisite */}
              <div>
                <p className="text-[10px] font-bold text-[#9B9589] tracking-widest mb-3 uppercase">
                  {method === 'BANK_CARD' ? 'Номер карты' : 'Номер телефона'}
                </p>
                <input
                  value={requisite}
                  onChange={(e) => { setRequisite(e.target.value); setError('') }}
                  placeholder={METHOD_CONFIG[method].placeholder}
                  className="w-full h-12 px-4 bg-[#F8F5F0] border border-[#E5DDD0] rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:border-[#1B2B20]"
                />
              </div>

              {/* Bank name */}
              {(method === 'BANK_CARD' || method === 'PHONE_TRANSFER') && (
                <div>
                  <p className="text-[10px] font-bold text-[#9B9589] tracking-widest mb-3 uppercase">Название банка</p>
                  <input
                    value={bankName}
                    onChange={(e) => { setBankName(e.target.value); setError('') }}
                    placeholder="Например: Mbank, Оптима"
                    className="w-full h-12 px-4 bg-[#F8F5F0] border border-[#E5DDD0] rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:border-[#1B2B20]"
                  />
                </div>
              )}

              {/* Info */}
              <div className="bg-[#EEE8DA]/40 border border-[#EEE8DA] rounded-2xl p-5 flex gap-4">
                <Info className="shrink-0 text-[#1B2B20]" size={20} />
                <div>
                  <h5 className="text-xs font-bold text-[#1A1A1A] mb-1">Внимание!</h5>
                  <p className="text-xs text-[#9B9589] leading-relaxed">
                    Убедитесь, что реквизиты указаны верно. После подачи заявку нельзя отменить.
                    Заявки рассматриваются администратором в течение 24 часов.
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="text-[11px] font-bold text-[#4A7C5E] bg-[#EDF5F1] border border-[#C8E6D4] rounded-xl px-4 py-3">
                  ✓ Заявка успешно подана! Ожидайте рассмотрения.
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 md:gap-4 pt-4">
                <button
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-[#9B9589] hover:text-[#1A1A1A] transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full sm:w-auto px-10 py-3.5 bg-[#1B2B20] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#1B2B20]/10 hover:bg-[#2C4A3E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '...' : 'Подать заявку'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white border border-[#E5DDD0] rounded-3xl p-6 h-fit shadow-sm sticky top-8">
            <h3 className="font-bold text-[#1A1A1A] mb-6">История</h3>

            {historyLoading && (
              <p className="text-center text-[#9B9589] text-xs font-bold animate-pulse uppercase tracking-widest py-8">
                Загрузка...
              </p>
            )}

            {!historyLoading && history.length === 0 && (
              <p className="text-center text-[10px] text-[#9B9589] font-medium italic py-8">
                — Выводов не было
              </p>
            )}

            {!historyLoading && history.length > 0 && (
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-[#F0EBE0]">
                      <th className="pb-3 text-[9px] font-bold text-[#9B9589] tracking-widest uppercase">Дата</th>
                      <th className="pb-3 text-[9px] font-bold text-[#9B9589] tracking-widest uppercase">Сумма</th>
                      <th className="pb-3 text-right text-[9px] font-bold text-[#9B9589] tracking-widest uppercase">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((w: any) => {
                      const st = STATUS_CONFIG[w.status] ?? STATUS_CONFIG.PENDING
                      return (
                        <tr key={w.id} className="border-b border-[#F0EBE0] last:border-b-0">
                          <td className="py-4 pr-3 text-xs font-medium text-[#9B9589] tracking-tight whitespace-nowrap">
                            {new Date(w.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                          </td>
                          <td className="py-4 pr-3 text-sm font-bold text-[#1A1A1A] whitespace-nowrap">
                            {(w.amount ?? 0).toLocaleString('ru-RU')}
                          </td>
                          <td className="py-4 text-right">
                            <span
                              className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase whitespace-nowrap"
                              style={{ backgroundColor: st.bg, color: st.text }}
                            >
                              ● {st.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </CabinetLayout>
  )
}
