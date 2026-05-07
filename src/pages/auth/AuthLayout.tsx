import React from 'react';
import { Leaf } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F1EDE5] flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Subtle Dot Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.1] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#9B9589 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} 
      />
      
      <div className="w-full max-w-[540px] bg-[#FEFDFB] rounded-[44px] border border-[#E5DDD0] shadow-2xl shadow-black/5 p-8 md:p-12 relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 bg-[#1B2B20] rounded-2xl flex items-center justify-center shadow-lg shadow-[#1B2B20]/20">
              <Leaf className="text-white" size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Green Eco Mall</h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#9B9589] uppercase tracking-widest">
                <span>Эко-платформа</span>
                <span className="w-1 h-1 rounded-full bg-[#D4CFC4]" />
                <span>Кыргызстан</span>
              </div>
            </div>
          </div>
          <div className="w-full border-t border-dashed border-[#E5DDD0]" />
        </div>
        
        {children}
        
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-[#9B9589] uppercase tracking-widest mb-6">
            <div className="w-32 h-px bg-[#E5DDD0]" />
            <span>или</span>
            <div className="w-32 h-px bg-[#E5DDD0]" />
          </div>
          
          <p className="text-[11px] font-bold text-[#9B9589] uppercase tracking-widest">
            © 2026 Green Eco Mall · Условия · Политика · Поддержка
          </p>
        </div>
      </div>
    </div>
  );
}
