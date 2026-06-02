import { CabinetLayout } from '#widgets/CabinetLayout'
import { useGetMyReferralsQuery } from '../api/userApi'

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:   { label: 'Активен',          color: '#4A7C5E', bg: '#EDF5F1' },
  PENDING:  { label: 'Ожидает оплаты',   color: '#E07840', bg: '#FEF3EC' },
  BLOCKED:  { label: 'Заблокирован',     color: '#D04040', bg: '#FEECEC' },
}

const PLAN_LABEL: Record<string, string> = {
  FAST_START: 'Fast Start',
  STANDARD:   'Standard',
  LEVEL_2:    'Уровень 2',
  LEVEL_3:    'Уровень 3',
  LEVEL_4:    'Уровень 4',
}

function getInitials(firstName?: string, lastName?: string) {
  return ((firstName?.[0] ?? '') + (lastName?.[0] ?? '')).toUpperCase() || '??'
}

function colorForInitials(initials: string) {
  const COLORS = ['#2C4A3E', '#3A7C8E', '#7C6A3A', '#3A5C8E', '#2A2A2A', '#8E7A3A', '#3A8E6A', '#7C3A3A']
  let hash = 0
  for (const c of initials) hash = (hash * 31 + c.charCodeAt(0)) % COLORS.length
  return COLORS[hash]
}

export default function ReferralsPage() {
  const { data, isLoading, isError } = useGetMyReferralsQuery()

  const referrals: any[] = Array.isArray(data) ? data : (data as any)?.data ?? []

  if (isLoading) {
    return (
      <CabinetLayout title="Мои рефералы">
        <div className="flex items-center justify-center h-64">
          <p className="text-[#9B9589] font-bold animate-pulse uppercase tracking-widest">Загрузка...</p>
        </div>
      </CabinetLayout>
    )
  }

  if (isError) {
    return (
      <CabinetLayout title="Мои рефералы">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-400 font-bold">Ошибка загрузки</p>
        </div>
      </CabinetLayout>
    )
  }

  return (
    <CabinetLayout title="Мои рефералы">
      <div className="space-y-4 max-w-3xl">

        {/* Counter */}
        <div className="flex items-center gap-3">
          <div className="h-10 px-4 rounded-2xl bg-white border border-[#E5DDD0] flex items-center gap-2 shadow-sm">
            <span className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">Всего</span>
            <span className="text-sm font-black text-[#1A1A1A]">{referrals.length}</span>
          </div>
          <div className="h-10 px-4 rounded-2xl bg-white border border-[#E5DDD0] flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#4A7C5E]" />
            <span className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">Активных</span>
            <span className="text-sm font-black text-[#1A1A1A]">
              {referrals.filter(r => r.accountStatus === 'ACTIVE').length}
            </span>
          </div>
          <div className="h-10 px-4 rounded-2xl bg-white border border-[#E5DDD0] flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#E07840]" />
            <span className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">Ожидают</span>
            <span className="text-sm font-black text-[#1A1A1A]">
              {referrals.filter(r => r.accountStatus === 'PENDING').length}
            </span>
          </div>
        </div>

        {/* List */}
        {referrals.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 rounded-3xl bg-white border border-[#E5DDD0]">
            <div className="w-14 h-14 rounded-2xl bg-[#F0EBE0] flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C5BDB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-bold text-[#1A1A1A]">Рефералов пока нет</p>
              <p className="text-sm text-[#9B9589] mt-1">Поделитесь реферальной ссылкой, чтобы пригласить участников</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((r: any) => {
              const initials = getInitials(r.firstName, r.lastName)
              const avatarColor = colorForInitials(initials)
              const st = STATUS_CFG[r.accountStatus] ?? STATUS_CFG.PENDING
              const plan = PLAN_LABEL[r.registrationPlan] ?? r.registrationPlan ?? '—'
              const regDate = r.createdAt
                ? new Date(r.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })
                : '—'

              return (
                <div key={r.id} className="flex items-center gap-4 bg-white border border-[#E5DDD0] rounded-2xl p-4 shadow-sm">
                  {/* Avatar */}
                  <div className="h-11 w-11 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: r.avatarUrl ? 'transparent' : avatarColor }}>
                    {r.avatarUrl
                      ? <img src={r.avatarUrl} alt={initials} className="h-full w-full object-cover" />
                      : initials
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-[#1A1A1A] truncate">
                        {r.firstName} {r.lastName}
                      </p>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
                        style={{ backgroundColor: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-[#9B9589]">{r.phone}</span>
                      <span className="text-[11px] font-bold text-[#1A1A1A]">
                        Ур. {r.currentLevel} · Эт. {r.currentStage}
                      </span>
                      <span className="text-[11px] text-[#9B9589]">{plan}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">Регистрация</p>
                    <p className="text-[12px] font-bold text-[#1A1A1A] mt-0.5">{regDate}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </CabinetLayout>
  )
}
