import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, AlertCircle, QrCode, ArrowLeft, Check } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useLoginMutation, useForgotPasswordMutation, useResetPasswordMutation } from '../../api/authApi';
import { useAuth } from '../../providers/AuthProvider';
import { useCreateQrMutation, useCheckPaymentMutation } from '../../api/paymentApi';

// ─── Forgot Password flow ─────────────────────────────────────────────────────

type ForgotStep = 'credentials' | 'otp' | 'newPassword' | 'done'

function ForgotPasswordView({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<ForgotStep>('credentials')
  const [phone, setPhone] = useState('+996')
  const [codeWord, setCodeWord] = useState('')
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
    if (!phone.trim() || !codeWord.trim()) {
      setError('Заполните все поля')
      return
    }
    try {
      await forgotPassword({ phone: phone.trim(), codeWord: codeWord.trim() }).unwrap()
      setOtp(['', '', '', '', '', ''])
      setTimer(300)
      setError('')
      setStep('otp')
    } catch (err: any) {
      setError(err?.data?.message ?? 'Неверный номер или кодовое слово')
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
      await forgotPassword({ phone: phone.trim(), codeWord: codeWord.trim() }).unwrap()
      setOtp(['', '', '', '', '', ''])
      setTimer(300)
      setError('')
    } catch (err: any) {
      setError(err?.data?.message ?? 'Ошибка отправки SMS')
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
            {step === 'otp' && `Введите код из SMS на номер ${phone}`}
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
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest block ml-1">Кодовое слово</label>
            <input className={inputCls} type="text" placeholder="Ваше кодовое слово при регистрации" value={codeWord} onChange={(e) => { setCodeWord(e.target.value); setError('') }} />
            <p className="text-[9px] font-medium text-[#9B9589] px-1">Слово, которое вы указали при регистрации</p>
          </div>
          {error && <ErrorAlert message={error} />}
          <button
            onClick={handleSendOtp}
            disabled={isSending}
            className="w-full h-14 bg-[#1B2B20] text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest shadow-xl shadow-[#1B2B20]/20 disabled:opacity-50 hover:bg-[#2C4A3E] transition-all"
          >
            {isSending ? '...' : 'Получить SMS-код'}
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
  const [createQr, { isLoading: creatingQr }] = useCreateQrMutation();
  const [checkPayment, { isLoading: checkingPayment }] = useCheckPaymentMutation();

  const [showPayment, setShowPayment] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [txId, setTxId] = useState('');
  const [paymentDone, setPaymentDone] = useState(false);

  useEffect(() => {
    if (!showPayment) return;
    createQr(undefined)
      .unwrap()
      .then((res) => {
        if (res?.data?.qrCode) setQrCode(res.data.qrCode);
        if (res?.data?.transactionId) setTxId(res.data.transactionId);
      })
      .catch(() => setError('Не удалось создать QR. Попробуйте позже.'));
  }, [showPayment]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    try {
      const result = await loginMutation({ phone, password }).unwrap();
      if (result.success && result.data?.accessToken) {
        if (result.data?.needsPayment) {
          localStorage.setItem('accessToken', result.data.accessToken);
          if (result.data.refreshToken) localStorage.setItem('refreshToken', result.data.refreshToken);
          if (result.data.userId) localStorage.setItem('userId', result.data.userId);
          if (result.data.transactionId) setTxId(result.data.transactionId);
          setShowPayment(true);
        } else {
          authLogin(result.data.accessToken, result.data.refreshToken, result.data.userId);
          navigate('/');
        }
      } else {
        setError('Неверный номер телефона или пароль');
      }
    } catch (err: any) {
      setError(err?.data?.message ?? 'Неверный номер телефона или пароль');
    }
  };

  const handlePaid = async () => {
    if (!txId) { navigate('/'); return; }
    try {
      await checkPayment(txId).unwrap();
      setPaymentDone(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      if (err?.status === 404) { navigate('/'); return; }
      setError(err?.data?.message ?? 'Платёж не подтверждён. Попробуйте позже.');
    }
  };

  const qrSrc = qrCode.startsWith('http') ? qrCode : `data:image/png;base64,${qrCode}`;

  if (showForgot) {
    return (
      <AuthLayout>
        <ForgotPasswordView onBack={() => setShowForgot(false)} />
      </AuthLayout>
    )
  }

  if (showPayment) {
    return (
      <AuthLayout>
        <div className="space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">{t('auth.payment_title')}</h2>
            <p className="text-sm font-medium text-[#9B9589]">{t('auth.payment_subtitle')}</p>
          </div>

          <div className="bg-white border border-[#E5DDD0] rounded-3xl p-6 shadow-xl shadow-black/5 flex flex-col md:flex-row items-center gap-6">
            <div className="h-36 w-36 bg-[#F8F5F0] rounded-2xl flex items-center justify-center p-2 shrink-0">
              {creatingQr ? (
                <QrCode size={80} className="text-[#E5DDD0] animate-pulse" strokeWidth={1.5} />
              ) : qrCode ? (
                <img src={qrSrc} alt="QR" className="h-full w-full rounded-xl object-contain" />
              ) : (
                <QrCode size={80} className="text-[#1B2B20] opacity-70" strokeWidth={1.5} />
              )}
            </div>
            <div className="flex-1 text-center md:text-left space-y-3">
              <h4 className="font-bold text-[#1A1A1A]">{t('auth.scan_qr')}</h4>
              <p className="text-[11px] font-medium text-[#9B9589] leading-relaxed">{t('auth.qr_hint')}</p>
              {txId && <p className="text-[10px] font-bold text-[#9B9589] font-mono">ID: {txId}</p>}
            </div>
          </div>

          {paymentDone ? (
            <div className="bg-[#EDF5F1] border border-[#4A7C5E]/20 rounded-2xl py-3 px-5 flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#4A7C5E] uppercase tracking-widest">✓ Платёж подтверждён! Переходим...</span>
            </div>
          ) : (
            <div className="bg-[#FEF3EC] border border-[#E07840]/20 rounded-2xl py-3 px-5 flex items-center justify-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E07840] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E07840]" />
              </span>
              <p className="text-[10px] font-bold text-[#E07840] uppercase tracking-widest">{t('auth.waiting_finik')}</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handlePaid}
              disabled={checkingPayment || paymentDone}
              className="w-full h-14 bg-[#1B2B20] text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest shadow-xl shadow-[#1B2B20]/20 hover:bg-[#2C4A3E] transition-all disabled:opacity-50"
            >
              {checkingPayment ? '...' : t('auth.i_paid')}
            </button>
            <button
              onClick={() => { setShowPayment(false); setError(''); }}
              className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold text-[#9B9589] uppercase tracking-[0.2em] hover:text-[#1A1A1A] transition-colors"
            >
              <ArrowLeft size={14} /> {t('auth.cancel_exit')}
            </button>
          </div>
        </div>
      </AuthLayout>
    );
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
