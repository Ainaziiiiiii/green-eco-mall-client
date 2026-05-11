import React, { useState } from 'react';
import { X, Pin, Wallet, Gift, Layers, BarChart3, Package, Users } from 'lucide-react';
import { CabinetLayout } from '#widgets/CabinetLayout';
import { cn } from '@/lib/utils';
import { useGetNewsQuery, useGetNewsByIdQuery } from '../api/newsApi';

// ─── Config ───────────────────────────────────────────────────────────────────

type Category = 'ALL' | 'LEVELS' | 'PAYMENTS' | 'PROMO' | 'STAGES' | 'PARTNERS' | 'COMMUNITY';

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'ALL',       label: 'Все' },
  { id: 'LEVELS',    label: 'Уровни' },
  { id: 'PAYMENTS',  label: 'Выплаты' },
  { id: 'PROMO',     label: 'Акции' },
  { id: 'STAGES',    label: 'Этапы' },
  { id: 'PARTNERS',  label: 'Партнёры' },
  { id: 'COMMUNITY', label: 'Сообщество' },
];

const CATEGORY_CONFIG: Record<Category, { label: string; bg: string; icon: React.ReactNode }> = {
  ALL:       { label: 'Все',        bg: '#1B2B20', icon: <Layers size={32} strokeWidth={1.5} /> },
  LEVELS:    { label: 'Уровни',     bg: '#1B2B20', icon: <Layers size={32} strokeWidth={1.5} /> },
  PAYMENTS:  { label: 'Выплаты',    bg: '#8A7355', icon: <Wallet size={32} strokeWidth={1.5} /> },
  PROMO:     { label: 'Акции',      bg: '#C46B3A', icon: <Gift size={32} strokeWidth={1.5} /> },
  STAGES:    { label: 'Этапы',      bg: '#2C4A3E', icon: <BarChart3 size={32} strokeWidth={1.5} /> },
  PARTNERS:  { label: 'Партнёры',   bg: '#7A6845', icon: <Package size={32} strokeWidth={1.5} /> },
  COMMUNITY: { label: 'Сообщество', bg: '#8A7355', icon: <Users size={32} strokeWidth={1.5} /> },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) +
    ' · ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

// ─── Card Image Placeholder ───────────────────────────────────────────────────

function CardImage({ category, imageUrl }: { category: Category; imageUrl?: string }) {
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.ALL;
  if (imageUrl) {
    return <img src={imageUrl} alt="" className="w-full h-full object-cover" />;
  }
  return (
    <div
      className="w-full h-full flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: cfg.bg }}
    >
      <div className="absolute w-40 h-40 rounded-full bg-white/5 -right-10 -bottom-10" />
      <div className="absolute w-24 h-24 rounded-full bg-white/5 -left-6 -top-6" />
      <div className="text-white/60">{cfg.icon}</div>
    </div>
  );
}

// ─── Featured (Pinned) Card ───────────────────────────────────────────────────

function FeaturedCard({ item, onClick }: { item: any; onClick: () => void }) {
  const category = (item.category as Category) ?? 'ALL';
  const cfg = CATEGORY_CONFIG[category];
  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#E5DDD0] rounded-3xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow grid grid-cols-1 md:grid-cols-2"
    >
      <div className="h-52 md:h-auto min-h-[200px]">
        <CardImage category={category} imageUrl={item.imageUrl} />
      </div>
      <div className="p-6 md:p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1B2B20] text-white text-[10px] font-black tracking-widest uppercase">
              <Pin size={9} /> Закреплено
            </span>
          </div>
          <p className="text-[10px] font-bold text-[#9B9589] tracking-widest uppercase mb-2">
            {cfg.label} · {item.createdAt ? formatDate(item.createdAt) : ''}
          </p>
          <h2 className="text-xl font-bold text-[#1A1A1A] leading-snug mb-3">{item.title}</h2>
          <p className="text-sm text-[#9B9589] leading-relaxed line-clamp-3">{item.summary ?? item.body}</p>
        </div>
        <button className="mt-5 text-sm font-bold text-[#1B2B20] hover:underline underline-offset-4 self-start">
          Читать полностью →
        </button>
      </div>
    </div>
  );
}

// ─── Regular Card ─────────────────────────────────────────────────────────────

function NewsCard({ item, onClick }: { item: any; onClick: () => void }) {
  const category = (item.category as Category) ?? 'ALL';
  const cfg = CATEGORY_CONFIG[category];
  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#E5DDD0] rounded-3xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow flex flex-col"
    >
      <div className="h-40">
        <CardImage category={category} imageUrl={item.imageUrl} />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <span
            className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase text-white"
            style={{ backgroundColor: cfg.bg }}
          >
            {cfg.label}
          </span>
        </div>
        <p className="text-[10px] text-[#9B9589] font-medium mb-1.5">
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) : ''}
        </p>
        <h3 className="text-sm font-bold text-[#1A1A1A] leading-snug mb-2 line-clamp-2">{item.title}</h3>
        <p className="text-xs text-[#9B9589] leading-relaxed line-clamp-2 flex-1">{item.summary ?? item.body}</p>
        <button className="mt-4 text-xs font-bold text-[#1B2B20] hover:underline underline-offset-2 self-start">
          Читать →
        </button>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function NewsModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, isLoading } = useGetNewsByIdQuery(id);
  const item = data?.data ?? data;
  const category = (item?.category as Category) ?? 'ALL';
  const cfg = CATEGORY_CONFIG[category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-52 relative">
          <CardImage category={category} imageUrl={item?.imageUrl} />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 md:p-8">
          {isLoading ? (
            <p className="text-center text-[#9B9589] text-xs font-bold animate-pulse py-8">Загрузка...</p>
          ) : item ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase text-white"
                  style={{ backgroundColor: cfg.bg }}
                >
                  {cfg.label}
                </span>
                <span className="text-[10px] text-[#9B9589] font-medium">
                  {item.createdAt ? formatDate(item.createdAt) : ''}
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A] leading-snug mb-4">{item.title}</h2>
              <div className="text-sm text-[#5A5147] leading-relaxed whitespace-pre-wrap">
                {item.body ?? item.content ?? item.summary}
              </div>
            </>
          ) : (
            <p className="text-center text-[#9B9589] text-xs py-8">Новость не найдена</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useGetNewsQuery({ category: activeCategory });
  const items: any[] = data?.data?.content ?? data?.data ?? data?.content ?? [];

  const pinned = items.find((i: any) => i.isPinned || i.pinned);
  const regular = items.filter((i: any) => !i.isPinned && !i.pinned);

  return (
    <CabinetLayout title="Новости">
      <div className="max-w-5xl space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-[#1A1A1A]">Новости</h2>
          <p className="text-sm text-[#9B9589] mt-1">
            Объявления, акции и изменения условий программы.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all border',
                activeCategory === cat.id
                  ? 'bg-[#1B2B20] text-white border-[#1B2B20]'
                  : 'bg-white text-[#1A1A1A] border-[#E5DDD0] hover:bg-[#F8F5F0]'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <p className="text-center text-[#9B9589] text-xs font-bold animate-pulse uppercase tracking-widest py-16">
            Загрузка...
          </p>
        )}

        {!isLoading && items.length === 0 && (
          <div className="bg-white border border-[#E5DDD0] rounded-3xl p-16 text-center">
            <p className="text-[#9B9589] text-sm">Новостей пока нет</p>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <div className="space-y-6">
            {pinned && (
              <FeaturedCard item={pinned} onClick={() => setSelectedId(pinned.id)} />
            )}
            {regular.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {regular.map((item: any) => (
                  <NewsCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedId && (
        <NewsModal id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </CabinetLayout>
  );
}
