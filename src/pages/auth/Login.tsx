import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, AlertCircle, ArrowLeft, Check } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useLoginMutation, useForgotPasswordMutation, useResetPasswordMutation } from '../../api/authApi';
import { useAuth } from '../../providers/AuthProvider';

// ─── Forgot Password flow ─────────────────────────────────────────────────────

type ForgotStep = 'credentials' | 'otp' | 'newPassword' | 'done'

function ForgotPasswordView({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<ForgotStep>('credentials')
  const [phone, setPhone] = useState('+996')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(300)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation()
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation()

  useEffect(() => {
    if (step !== 'otp' || timer <= 0) return
    const id = setInterval(() => setTimer((p) => p - 1), 1000)
    return () => clearInterval(id)
  }, [step, timer])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setError('Введите номер телефона')
      return
    }
    try {
      await forgotPassword({ phone: phone.trim() }).unwrap()
      setOtp(['', '', '', '', '', ''])
      setTimer(300)
      setError('')
      setStep('otp')
    } catch (err: any) {
      setError(err?.data?.message ?? 'Номер не найден')
    }
  }

  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Введите 6-значный код'); return }
    setError('')
    setStep('newPassword')
  }

  const handleResend = async () => {
    try {
      await forgotPassword({ phone: phone.trim() }).unwrap()
      setOtp(['', '', '', '', '', ''])
      setTimer(300)
      setError('')
    } catch (err: any) {
      setError(err?.data?.message ?? 'Ошибка отправки кода')
    }
  }

  const handleResetPassword = async () => {
    if (newPassword.length < 6) { setError('Пароль минимум 6 символов'); return }
    if (newPassword !== confirmPassword) { setError('Пароли не совпадают'); return }
    try {
      await resetPassword({ phone: phone.trim(), code: otp.join(''), newPassword }).unwrap()
      setError('')
      setStep('done')
    } catch (err: any) {
      setError(err?.data?.message ?? 'Ошибка сброса пароля. Попробуйте снова.')
    }
  }

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const next = [...otp]; next[i] = v; setOtp(next)
    if (v && i < 5) refs.current[i + 1]?.focus()
  }
  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = [...digits.split(''), ...Array(6 - digits.length).fill('')]
    setOtp(next.slice(0, 6))
    refs.current[Math.min(digits.length, 5)]?.focus()
    e.preventDefault()
  }

  const inputCls = 'w-full h-14 px-5 bg-[#F8F5F0] border border-[#E5DDD0] rounded-2xl text-[15px] font-bold text-[#1A1A1A] placeholder:text-[#9B9589]/40 focus:outline-none focus:border-[#1B2B20] transition-colors'

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-[#9B9589] hover:text-[#1A1A1A] transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Восстановление пароля</h2>
          <p className="text-sm text-[#9B9589] mt-0.5">
            {step === 'credentials' && 'Введите номер и кодовое слово'}
            {step === 'otp' && `Код отправлен в Telegram на номер ${phone}`}
            {step === 'newPassword' && 'Придумайте новый пароль'}
            {step === 'done' && 'Пароль успешно изменён'}
          </p>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {(['credentials', 'otp', 'newPassword', 'done'] as ForgotStep[]).map((s, i) => {
          const idx = ['credentials', 'otp', 'newPassword', 'done'].indexOf(step)
          return (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${
              i === idx ? 'w-12 bg-[#1B2B20]' : i < idx ? 'w-4 bg-[#4A7C5E]' : 'w-8 bg-[#E5DDD0]'
            }`} />
          )
        })}
      </div>

      {/* Step: credentials */}
      {step === 'credentials' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest block ml-1">Номер телефона</label>
            <input className={inputCls} type="tel" placeholder="+996 555 12 34 56" value={phone} onChange={(e) => { setPhone(e.target.value); setError('') }} />
            <p className="text-[9px] font-medium text-[#9B9589] px-1">Код придёт в ваш Telegram</p>
          </div>
          {error && <ErrorAlert message={error} />}
          <button
            onClick={handleSendOtp}
            disabled={isSending}
            className="w-full h-14 bg-[#1B2B20] text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest shadow-xl shadow-[#1B2B20]/20 disabled:opacity-50 hover:bg-[#2C4A3E] transition-all"
          >
            {isSending ? '...' : 'Получить код'}
          </button>
        </div>
      )}

      {/* Step: OTP */}
      {step === 'otp' && (
        <div className="space-y-6">
          <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
            {otp.map((val, i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className={`w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#1B2B20]/20 ${
                  val ? 'bg-white border-[#1B2B20] text-[#1A1A1A] shadow-sm' : 'bg-[#F8F5F0] border-[#E5DDD0]'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest flex items-center gap-2">
              <AlertCircle size={14} className="text-[#E07840]" />
              Истекает через {formatTime(timer)}
            </span>
            <button
              disabled={timer > 0}
              onClick={handleResend}
              className="text-[10px] font-bold text-[#1B2B20] border-b border-[#1B2B20] uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Отправить снова
            </button>
          </div>
          {error && <ErrorAlert message={error} />}
          <button
            onClick={handleVerifyOtp}
            disabled={otp.join('').length < 6}
            className="w-full h-14 bg-[#1B2B20] text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest shadow-xl shadow-[#1B2B20]/20 disabled:opacity-50 hover:bg-[#2C4A3E] transition-all"
          >
            Подтвердить код
          </button>
        </div>
      )}

      {/* Step: new password */}
      {step === 'newPassword' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest block ml-1">Новый пароль</label>
            <div className="relative">
              <input
                className={inputCls}
                type={showPwd ? 'text' : 'password'}
                placeholder="........"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError('') }}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9589] hover:text-[#1B2B20] transition-colors">
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest block ml-1">Повторите пароль</label>
            <input
              className={inputCls}
              type="password"
              placeholder="........"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
            />
          </div>
          {error && <ErrorAlert message={error} />}
          <button
            onClick={handleResetPassword}
            disabled={isResetting}
            className="w-full h-14 bg-[#1B2B20] text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest shadow-xl shadow-[#1B2B20]/20 disabled:opacity-50 hover:bg-[#2C4A3E] transition-all"
          >
            {isResetting ? '...' : 'Сохранить пароль'}
          </button>
        </div>
      )}

      {/* Step: done */}
      {step === 'done' && (
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="w-16 h-16 rounded-2xl bg-[#EDF5F1] flex items-center justify-center">
            <Check size={32} className="text-[#4A7C5E]" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#1A1A1A]">Пароль изменён!</p>
            <p className="text-sm text-[#9B9589] mt-1">Теперь войдите с новым паролем</p>
          </div>
          <button
            onClick={onBack}
            className="w-full h-14 bg-[#1B2B20] text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest shadow-xl shadow-[#1B2B20]/20 hover:bg-[#2C4A3E] transition-all"
          >
            Войти
          </button>
        </div>
      )}
    </div>
  )
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
      <AlertCircle size={14} className="shrink-0" />
      {message}
    </div>
  )
}

export default function Login() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('+996');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();
  const [loginMutation, { isLoading }] = useLoginMutation();
  const { login: authLogin } = useAuth();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    try {
      const result = await loginMutation({ phone, password }).unwrap();
      if (result.success && result.data?.accessToken) {
        authLogin(result.data.accessToken, result.data.refreshToken, result.data.userId);
        navigate('/');
      } else {
        setError('Неверный номер телефона или пароль');
      }
    } catch (err: any) {
      setError(err?.data?.message ?? 'Неверный номер телефона или пароль');
    }
  };

  if (showForgot) {
    return (
      <AuthLayout>
        <ForgotPasswordView onBack={() => setShowForgot(false)} />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2 tracking-tight">
              {t('auth.login_title')}
            </h2>
            <p className="text-sm font-medium text-[#9B9589]">{t('auth.login_subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest block ml-1">
                {t('auth.phone_label')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPhone(e.target.value);
                  setError('');
                }}
                placeholder="+996 555 12 34 56"
                className="w-full h-14 px-5 bg-[#F8F5F0] border border-[#E5DDD0] rounded-2xl text-[15px] font-bold text-[#1A1A1A] placeholder:text-[#9B9589]/50 focus:outline-none focus:ring-2 focus:ring-[#1B2B20]/5 focus:border-[#1B2B20] transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest block">
                  {t('auth.password_label')}
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-[10px] font-bold text-[#E07840] hover:text-[#D06830] transition-colors uppercase tracking-widest"
                >
                  {t('auth.forgot_password')}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="........"
                  className="w-full h-14 px-5 bg-[#F8F5F0] border border-[#E5DDD0] rounded-2xl text-[15px] font-bold text-[#1A1A1A] placeholder:text-[#9B9589]/50 focus:outline-none focus:ring-2 focus:ring-[#1B2B20]/5 focus:border-[#1B2B20] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9B9589] hover:text-[#1B2B20] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-[#1B2B20] text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest shadow-xl shadow-[#1B2B20]/20 hover:bg-[#2C4A3E] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? '...' : t('common.login')}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-[11px] font-bold text-[#9B9589] uppercase tracking-widest">
            {t('auth.no_account')}{' '}
            <Link
              to="/register"
              className="text-[#1B2B20] border-b border-[#1B2B20] pb-0.5 ml-1 hover:text-[#2C4A3E] hover:border-[#2C4A3E] transition-colors"
            >
              {t('auth.register_link')}
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
