import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ShieldCheck, AlertCircle, QrCode, ArrowLeft } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { useLoginMutation } from '../../api/authApi';
import { useAuth } from '../../providers/AuthProvider';
import { useCreateQrMutation, useCheckPaymentMutation } from '../../api/paymentApi';

export default function Login() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-[#1B2B20] text-white rounded-2xl text-[13px] font-bold uppercase tracking-widest shadow-xl shadow-[#1B2B20]/20 hover:bg-[#2C4A3E] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? '...' : t('auth.login_as_user')}
            </button>
            <button
              type="button"
              className="w-full h-14 bg-white border border-[#E5DDD0] text-[#1A1A1A] rounded-2xl text-[13px] font-bold uppercase tracking-widest hover:bg-[#F8F5F0] transition-all flex items-center justify-center gap-3"
            >
              <ShieldCheck size={18} className="text-[#9B9589]" />
              {t('auth.login_as_admin')}
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
