import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Copy, Check, AlertCircle, Smartphone, UserCheck } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRegisterMutation,
  useLoginMutation,
  useGetInviterQuery,
} from '../../api/authApi';
import { useCreateQrMutation } from '../../api/paymentApi';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function ErrorBox({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
      <AlertCircle size={14} className="shrink-0" />
      {message}
    </div>
  );
}

function InputField({
  label,
  placeholder,
  type = 'text',
  sub,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  sub?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest block ml-1">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-14 px-5 bg-[#F8F5F0] border border-[#E5DDD0] rounded-2xl text-[15px] font-bold text-[#1A1A1A] placeholder:text-[#9B9589]/40 focus:outline-none focus:border-[#1B2B20] transition-colors"
      />
      {sub && <p className="text-[9px] font-medium text-[#9B9589] leading-tight px-1">{sub}</p>}
    </div>
  );
}

// ─── Prop types ───────────────────────────────────────────────────────────────

interface Step1Props {
  referralCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  setReferralCode: (v: string) => void;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setPhone: (v: string) => void;
  onNext: () => void;
  error: string;
}

interface Step2Props {
  passportNumber: string;
  password: string;
  confirmPassword: string;
  setPassportNumber: (v: string) => void;
  setPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  onNext: () => void;
  isLoading: boolean;
  error: string;
}

interface Step3Props {
  phone: string;
  otp: string[];
  setOtp: (v: string[]) => void;
  timer: number;
  onNext: () => void;
  onBack: () => void;
  onResend: () => void;
  isLoading: boolean;
  error: string;
  formatTime: (s: number) => string;
}

interface Step4Props {
  transactionId?: string;
}

// ─── Step 1 — Basic Info ──────────────────────────────────────────────────────

function Step1({
  referralCode,
  firstName,
  lastName,
  phone,
  setReferralCode,
  setFirstName,
  setLastName,
  setPhone,
  onNext,
  error,
}: Step1Props) {
  const { t } = useTranslation();

  const [debouncedCode, setDebouncedCode] = useState(referralCode);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedCode(referralCode), 500);
    return () => clearTimeout(id);
  }, [referralCode]);

  const shouldLookup = debouncedCode.trim().length >= 6;
  const { data: inviterData, isFetching: isLookingUp } = useGetInviterQuery(debouncedCode.trim(), {
    skip: !shouldLookup,
  });
  const inviter = inviterData?.success ? inviterData.data : null;

  return (
    <div className="space-y-6">
      {/* Inviter card */}
      <div
        className={cn(
          'rounded-3xl p-5 flex items-center gap-4 border transition-all',
          inviter
            ? 'bg-[#EDF5F1] border-[#4A7C5E]/20'
            : 'bg-[#F8F5F0] border-[#E5DDD0]'
        )}
      >
        <div
          className={cn(
            'h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
            inviter ? 'bg-[#4A7C5E]' : 'bg-[#E5DDD0]'
          )}
        >
          <UserCheck size={18} className={inviter ? 'text-white' : 'text-[#9B9589]'} />
        </div>
        <div className="flex-1 min-w-0">
          {isLookingUp ? (
            <p className="text-[11px] font-bold text-[#9B9589]">Проверяем код...</p>
          ) : inviter ? (
            <>
              <p className="text-sm font-bold text-[#1A1A1A]">{inviter.name}</p>
              <p className="text-[10px] font-bold text-[#4A7C5E] uppercase tracking-widest">
                Пригласил вас · Уровень {inviter.currentLevel}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-[#1A1A1A]">Введите реферальный код</p>
              <p className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">
                Код пригласившего вас участника
              </p>
            </>
          )}
        </div>
        {inviter && (
          <div className="px-2 py-1 bg-[#4A7C5E] rounded-md text-[8px] font-bold text-white uppercase tracking-tighter shrink-0">
            ● КОД НАЙДЕН
          </div>
        )}
      </div>

      <div className="space-y-4">
        <InputField
          label="РЕФЕРАЛЬНЫЙ КОД"
          placeholder="GEM7K2QP"
          value={referralCode}
          onChange={setReferralCode}
          sub="8 символов. Это код пригласившего вас участника."
        />
        <InputField label="ИМЯ" placeholder="Азамат" value={firstName} onChange={setFirstName} />
        <InputField
          label="ФАМИЛИЯ"
          placeholder="Орозбаев"
          value={lastName}
          onChange={setLastName}
        />
        <InputField
          label="НОМЕР ТЕЛЕФОНА"
          placeholder="+996 555 12 34 56"
          value={phone}
          onChange={setPhone}
          type="tel"
          sub="На этот номер придёт SMS с 6-значным кодом подтверждения"
        />
      </div>

      <ErrorBox message={error} />

      <button
        onClick={onNext}
        className="w-full h-14 bg-[#1B2B20] text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest shadow-xl shadow-[#1B2B20]/20 hover:bg-[#2C4A3E] hover:-translate-y-0.5 active:translate-y-0 transition-all"
      >
        {t('common.continue') || 'Продолжить'}
      </button>
    </div>
  );
}

// ─── Step 2 — Passport & Password ─────────────────────────────────────────────

function Step2({
  passportNumber,
  password,
  confirmPassword,
  setPassportNumber,
  setPassword,
  setConfirmPassword,
  onNext,
  isLoading,
  error,
}: Step2Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">{t('auth.passport_password')}</h2>
        <p className="text-sm font-medium text-[#9B9589]">{t('auth.passport_subtitle')}</p>
      </div>

      <div className="space-y-4">
        <InputField
          label={t('auth.passport_label')}
          placeholder="AN1234567"
          value={passportNumber}
          onChange={setPassportNumber}
          sub={t('auth.passport_hint')}
        />
        <InputField
          label={t('auth.password_label')}
          type="password"
          placeholder="........"
          value={password}
          onChange={setPassword}
        />
        <InputField
          label={t('auth.repeat_password')}
          type="password"
          placeholder="........"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
      </div>

      <div className="space-y-4 px-1">
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="mt-0.5">
            <div className="w-5 h-5 rounded-md border-2 border-[#1B2B20] flex items-center justify-center bg-[#1B2B20]">
              <Check size={14} className="text-white" />
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#1A1A1A] leading-relaxed">
            {t('auth.accept_terms')}
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <div className="mt-0.5">
            <div className="w-5 h-5 rounded-md border-2 border-[#1B2B20] flex items-center justify-center bg-[#1B2B20]">
              <Check size={14} className="text-white" />
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#1A1A1A] leading-relaxed">
            {t('auth.understand_fee')}{' '}
            <span className="text-[#1B2B20]">10 000 сом</span>
          </span>
        </label>
      </div>

      <ErrorBox message={error} />

      <button
        onClick={onNext}
        disabled={isLoading}
        className="w-full h-14 bg-[#1B2B20] text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest shadow-xl shadow-[#1B2B20]/20 disabled:opacity-50 transition-all"
      >
        {isLoading ? '...' : t('auth.create_account_pay')}
      </button>
    </div>
  );
}

// ─── Step 3 — OTP Verification ────────────────────────────────────────────────

function Step3({
  phone,
  otp,
  setOtp,
  timer,
  onNext,
  onBack,
  onResend,
  isLoading,
  error,
  formatTime,
}: Step3Props) {
  const { t } = useTranslation();
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...digits.split(''), ...Array(6 - digits.length).fill('')];
    setOtp(next.slice(0, 6));
    refs.current[Math.min(digits.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">{t('auth.confirm_phone')}</h2>
        <p className="text-sm font-medium text-[#9B9589]">{t('auth.enter_sms')}</p>
      </div>

      <div className="bg-[#F8F5F0] border border-[#E5DDD0] rounded-2xl p-4 flex items-center justify-center gap-3">
        <Smartphone size={16} className="text-[#9B9589]" />
        <p className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">
          {t('auth.sms_sent_to', { phone })}
        </p>
      </div>

      <div className="flex justify-between gap-2 md:gap-3" onPaste={handlePaste}>
        {otp.map((val, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={cn(
              'w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#1B2B20]/20',
              val
                ? 'bg-white border-[#1B2B20] text-[#1A1A1A] shadow-sm'
                : 'bg-[#F8F5F0] border-[#E5DDD0]'
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">
          <AlertCircle size={14} className="text-[#E07840]" />
          {t('auth.expires_in', { time: formatTime(timer) })}
        </div>
        <button
          type="button"
          disabled={timer > 0}
          onClick={onResend}
          className="text-[10px] font-bold text-[#1B2B20] border-b border-[#1B2B20] uppercase tracking-widest hover:text-[#2C4A3E] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('auth.resend_sms')}
        </button>
      </div>

      <ErrorBox message={error} />

      <button
        onClick={onNext}
        disabled={isLoading || otp.join('').length < 6}
        className="w-full h-14 bg-[#1B2B20] text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest shadow-xl shadow-[#1B2B20]/20 disabled:opacity-50 transition-all"
      >
        {isLoading ? '...' : t('auth.confirm_code')}
      </button>

      <button
        onClick={onBack}
        className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold text-[#9B9589] uppercase tracking-[0.2em] hover:text-[#1A1A1A] transition-colors"
      >
        <ArrowLeft size={14} /> {t('auth.change_phone')}
      </button>
    </div>
  );
}

// ─── Step 4 — Payment ─────────────────────────────────────────────────────────

function Step4({ transactionId: _initialTxId }: Step4Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [createQr] = useCreateQrMutation();
  const [qrError, setQrError] = useState('');
  const [redirecting, setRedirecting] = useState(true);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    createQr(undefined)
      .unwrap()
      .then((res) => {
        const url = res?.data?.qrCode;
        if (url) {
          window.location.href = url;
        } else {
          setQrError('Не удалось получить ссылку для оплаты.');
          setRedirecting(false);
        }
      })
      .catch(() => {
        setQrError('Не удалось создать платёж. Попробуйте позже.');
        setRedirecting(false);
      });
  }, []);

  if (redirecting && !qrError) {
    return (
      <div className="space-y-8 text-center">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">{t('auth.payment_title')}</h2>
          <p className="text-sm font-medium text-[#9B9589]">{t('auth.payment_subtitle')}</p>
        </div>
        <div className="flex flex-col items-center gap-4 py-10">
          <div className="w-10 h-10 rounded-full border-4 border-[#E5DDD0] border-t-[#1B2B20] animate-spin" />
          <p className="text-[11px] font-bold text-[#9B9589] uppercase tracking-widest">
            Переходим к оплате...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">{t('auth.payment_title')}</h2>
        <p className="text-sm font-medium text-[#9B9589]">{t('auth.payment_subtitle')}</p>
      </div>

      <ErrorBox message={qrError} />

      <div className="space-y-4">
        <button
          onClick={() => {
            called.current = false;
            setQrError('');
            setRedirecting(true);
          }}
          className="w-full h-14 bg-[#1B2B20] text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest shadow-xl shadow-[#1B2B20]/20 hover:bg-[#2C4A3E] transition-all"
        >
          Попробовать снова
        </button>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold text-[#9B9589] uppercase tracking-[0.2em] hover:text-[#1A1A1A] transition-colors"
        >
          <ArrowLeft size={14} /> {t('auth.cancel_exit')}
        </button>
      </div>
    </div>
  );
}

// ─── Main Register Component ──────────────────────────────────────────────────

export default function Register() {
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(300);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Step 1 — basic info
  const [referralCode, setReferralCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2 — security
  const [passportNumber, setPassportNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 3 — OTP
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);

  const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();
  const [loginMutation] = useLoginMutation();
  const [sendOtpMutation, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [verifyOtpMutation, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();

  useEffect(() => {
    if (step !== 3 || timer <= 0) return;
    const id = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const nextStep = (preserveError = false) => {
    if (!preserveError) setError('');
    setStep((p) => Math.min(p + 1, 4));
  };

  const prevStep = () => {
    setError('');
    setStep((p) => Math.max(p - 1, 1));
  };

  // Step 1: validate and advance
  const handleStep1 = () => {
    if (!referralCode || !firstName || !lastName || !phone) {
      setError('Заполните все поля');
      return;
    }
    nextStep();
  };

  // Step 2: register → sendOtp → advance to OTP step
  const handleStep2 = async () => {
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    // ── [ШАГ 1/5] Register ────────────────────────────────────────────────────
    // Separate try-catch so an OTP failure doesn't look like a register failure.
    try {
      const result = await registerMutation({
        firstName, lastName, phone, passportNumber, password, referralCode,
      }).unwrap();

      if (result?.data?.accessToken) {
        localStorage.setItem('accessToken', result.data.accessToken);
        if (result.data.refreshToken) localStorage.setItem('refreshToken', result.data.refreshToken);
        if (result.data.userId) localStorage.setItem('userId', result.data.userId);
        if (result.data.transactionId) setTransactionId(result.data.transactionId);
        if (result.data.paymentId) setTransactionId(result.data.paymentId);
      }
    } catch (regErr: any) {
      const msg: string = regErr?.data?.message ?? '';
      const alreadyExists =
        msg.toLowerCase().includes('exist') ||
        msg.toLowerCase().includes('already') ||
        regErr?.status === 409;

      if (!alreadyExists) {
        // Hard register error (bad data, server error, etc.) — stop here.
        setError(msg || 'Ошибка регистрации. Проверьте данные и попробуйте снова.');
        return;
      }

      // User was created in a previous attempt but never confirmed OTP.
      // Try a silent login to get a fresh token so we can re-send OTP.
      try {
        const loginResult = await loginMutation({ phone, password }).unwrap();
        if (loginResult?.data?.accessToken) {
          localStorage.setItem('accessToken', loginResult.data.accessToken);
          if (loginResult.data.refreshToken) localStorage.setItem('refreshToken', loginResult.data.refreshToken);
          if (loginResult.data.userId) localStorage.setItem('userId', loginResult.data.userId);
        }
      } catch {
        // Login failed too — wrong password or fully confirmed account.
        setError('Аккаунт с таким номером уже существует. Войдите через страницу входа.');
        return;
      }
    }

    // ── [ШАГ 2/5] Send OTP ────────────────────────────────────────────────────
    // Even if this fails we still advance so the user can hit "Resend".
    let otpSent = false;
    try {
      await sendOtpMutation(phone).unwrap();
      otpSent = true;
    } catch {
      // Will be shown as a resend prompt in Step 3.
    }

    setOtp(['', '', '', '', '', '']);
    setTimer(otpSent ? 300 : 0); // timer=0 → resend button immediately available
    setError(otpSent ? '' : 'SMS не удалось отправить. Нажмите «Отправить снова».');
    nextStep(!otpSent); // preserve the OTP error message when advancing
  };

  // Step 3: verify OTP
  const handleStep3 = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Введите 6-значный код');
      return;
    }
    try {
      // [ШАГ 3/5] Verify OTP
      await verifyOtpMutation({ phone, code }).unwrap();
      nextStep();
    } catch (err: any) {
      setError(err?.data?.message ?? 'Неверный код. Попробуйте ещё раз.');
    }
  };

  const handleResendOtp = async () => {
    try {
      await sendOtpMutation(phone).unwrap();
      setTimer(300);
      setOtp(['', '', '', '', '', '']);
      setError('');
    } catch (err: any) {
      setError(err?.data?.message ?? 'Ошибка отправки SMS.');
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-8">
        {/* Progress header */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="flex gap-1.5 h-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500',
                    s === step
                      ? 'w-12 bg-[#1B2B20]'
                      : s < step
                        ? 'w-4 bg-[#4A7C5E]'
                        : 'w-8 bg-[#E5DDD0]'
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">
                {t('auth.step_of', { current: step, total: 4 })}
              </span>
              <LanguageSwitcher />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-[#1A1A1A] tracking-tight">
            {t('auth.register_title')}
          </h2>
          <p className="text-sm font-medium text-[#9B9589] leading-relaxed">
            {t('auth.register_subtitle')}
          </p>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {step === 1 && (
              <Step1
                referralCode={referralCode}
                firstName={firstName}
                lastName={lastName}
                phone={phone}
                setReferralCode={setReferralCode}
                setFirstName={setFirstName}
                setLastName={setLastName}
                setPhone={setPhone}
                onNext={handleStep1}
                error={error}
              />
            )}
            {step === 2 && (
              <Step2
                passportNumber={passportNumber}
                password={password}
                confirmPassword={confirmPassword}
                setPassportNumber={setPassportNumber}
                setPassword={setPassword}
                setConfirmPassword={setConfirmPassword}
                onNext={handleStep2}
                isLoading={isRegistering || isSendingOtp}
                error={error}
              />
            )}
            {step === 3 && (
              <Step3
                phone={phone}
                otp={otp}
                setOtp={setOtp}
                timer={timer}
                onNext={handleStep3}
                onBack={prevStep}
                onResend={handleResendOtp}
                isLoading={isVerifyingOtp}
                error={error}
                formatTime={formatTime}
              />
            )}
            {step === 4 && <Step4 transactionId={transactionId} />}
          </motion.div>
        </AnimatePresence>

        {step < 4 && (
          <div className="text-center pt-2">
            <p className="text-[11px] font-bold text-[#9B9589] uppercase tracking-widest">
              Уже есть аккаунт?{' '}
              <Link
                to="/login"
                className="text-[#1B2B20] border-b border-[#1B2B20] pb-0.5 ml-1 hover:text-[#2C4A3E] hover:border-[#2C4A3E] transition-colors"
              >
                {t('common.login')}
              </Link>
            </p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
