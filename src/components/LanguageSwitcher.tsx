import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ru' ? 'ky' : 'ru';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-[#9B9589] hover:text-[#1A1A1A] hover:bg-[#F8F5F0] transition-all border border-[#E5DDD0]"
    >
      <Languages size={14} className="text-[#1B2B20]" />
      <span>{i18n.language === 'ru' ? 'RU' : 'KY'}</span>
    </button>
  );
}
