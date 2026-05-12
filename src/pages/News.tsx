import React, { useState, useRef, useEffect } from 'react';
import { X, Pin, Wallet, Gift, Layers, BarChart3, Package, Users, MessageSquare, Trash2, Send } from 'lucide-react';
import { CabinetLayout } from '#widgets/CabinetLayout';
import { useGetNewsQuery, useGetNewsByIdQuery, useGetNewsCommentsQuery, useAddCommentMutation, useDeleteCommentMutation } from '../api/newsApi';

// ─── Config ───────────────────────────────────────────────────────────────────

type Category = 'ALL' | 'LEVELS' | 'PAYMENTS' | 'PROMO' | 'STAGES' | 'PARTNERS' | 'COMMUNITY';

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

function colorForInitials(s?: string) {
  const COLORS = ['#2C4A3E', '#3A7C8E', '#7C6A3A', '#3A5C8E', '#8E7A3A', '#3A8E6A', '#7C3A3A'];
  if (!s) return '#9B9589';
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % COLORS.length;
  return COLORS[h];
}

// ─── Card Image ───────────────────────────────────────────────────────────────

function CardImage({ category, imageUrl }: { category: Category; imageUrl?: string }) {
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.ALL;
  if (imageUrl) return <img src={imageUrl} alt="" className="w-full h-full object-cover" />;
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: cfg.bg }}>
      <div className="absolute w-40 h-40 rounded-full bg-white/5 -right-10 -bottom-10" />
      <div className="absolute w-24 h-24 rounded-full bg-white/5 -left-6 -top-6" />
      <div className="text-white/60">{cfg.icon}</div>
    </div>
  );
}

// ─── Featured Card ────────────────────────────────────────────────────────────

function FeaturedCard({ item, onClick }: { item: any; onClick: () => void }) {
  const category = (item.category as Category) ?? 'ALL';
  const cfg = CATEGORY_CONFIG[category];
  return (
    <div onClick={onClick} className="bg-white border border-[#E5DDD0] rounded-3xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow grid grid-cols-1 md:grid-cols-2">
      <div className="h-52 md:h-auto min-h-[200px]">
        <CardImage category={category} imageUrl={item.media?.[0]?.url ?? item.imageUrl} />
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
        <div className="mt-5 flex items-center justify-between">
          <button className="text-sm font-bold text-[#1B2B20] hover:underline underline-offset-4">Читать полностью →</button>
          {item.commentCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-[#9B9589]">
              <MessageSquare size={13} /> {item.commentCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Regular Card ─────────────────────────────────────────────────────────────

function NewsCard({ item, onClick }: { item: any; onClick: () => void }) {
  const category = (item.category as Category) ?? 'ALL';
  const cfg = CATEGORY_CONFIG[category];
  return (
    <div onClick={onClick} className="bg-white border border-[#E5DDD0] rounded-3xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow flex flex-col">
      <div className="h-40">
        <CardImage category={category} imageUrl={item.media?.[0]?.url ?? item.imageUrl} />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <span className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase text-white" style={{ backgroundColor: cfg.bg }}>
            {cfg.label}
          </span>
        </div>
        <p className="text-[10px] text-[#9B9589] font-medium mb-1.5">
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) : ''}
        </p>
        <h3 className="text-sm font-bold text-[#1A1A1A] leading-snug mb-2 line-clamp-2">{item.title}</h3>
        <p className="text-xs text-[#9B9589] leading-relaxed line-clamp-2 flex-1">{item.summary ?? item.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <button className="text-xs font-bold text-[#1B2B20] hover:underline underline-offset-2">Читать →</button>
          {item.commentCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-[#9B9589]">
              <MessageSquare size={11} /> {item.commentCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Comments Section ─────────────────────────────────────────────────────────

function CommentsSection({ newsId }: { newsId: string }) {
  const { data: commentsData, isLoading } = useGetNewsCommentsQuery({ id: newsId });
  const [addComment, { isLoading: sending }] = useAddCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const comments: any[] = commentsData?.data?.content ?? commentsData?.data ?? commentsData?.content ?? [];

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      await addComment({ id: newsId, text: text.trim() }).unwrap();
      setText('');
    } catch {}
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="border-t border-[#F0EBE0] pt-6 mt-6">
      <h4 className="text-sm font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
        <MessageSquare size={15} className="text-[#9B9589]" />
        Комментарии {comments.length > 0 && <span className="text-[#9B9589] font-medium">({comments.length})</span>}
      </h4>

      {isLoading && <p className="text-xs text-[#9B9589] animate-pulse py-4">Загрузка...</p>}

      {!isLoading && comments.length === 0 && (
        <p className="text-xs text-[#9B9589] italic py-2">Комментариев пока нет. Будьте первым!</p>
      )}

      {comments.length > 0 && (
        <div className="space-y-4 mb-5">
          {comments.map((c: any) => (
            <div key={c.id} className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                style={{ backgroundColor: colorForInitials(c.authorInitials) }}
              >
                {c.authorInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-[#1A1A1A]">{c.authorName}</span>
                  <span className="text-[10px] text-[#9B9589]">{c.createdAt ? formatDate(c.createdAt) : ''}</span>
                </div>
                <p className="text-sm text-[#5A5147] mt-0.5 leading-relaxed">{c.text}</p>
              </div>
              {c.ownComment && (
                <button
                  onClick={() => deleteComment({ newsId, commentId: c.id })}
                  className="shrink-0 text-[#9B9589] hover:text-red-400 transition-colors mt-0.5"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Написать комментарий..."
          rows={2}
          className="flex-1 resize-none px-4 py-3 bg-[#F8F5F0] border border-[#E5DDD0] rounded-2xl text-sm text-[#1A1A1A] placeholder:text-[#9B9589]/50 focus:outline-none focus:border-[#1B2B20] transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="w-10 h-10 rounded-xl bg-[#1B2B20] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#2C4A3E] transition-colors shrink-0"
        >
          <Send size={15} />
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
  const media: any[] = item?.media ?? [];
  const mainImage = media[0]?.url ?? item?.imageUrl;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-52 relative">
          <CardImage category={category} imageUrl={mainImage} />
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
                <span className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase text-white" style={{ backgroundColor: cfg.bg }}>
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

              {/* Extra media gallery */}
              {media.length > 1 && (
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {media.slice(1).map((m: any) => (
                    <a key={m.id} href={m.url} target="_blank" rel="noreferrer">
                      <img src={m.url} alt="" className="w-full h-28 object-cover rounded-xl" />
                    </a>
                  ))}
                </div>
              )}

              <CommentsSection newsId={id} />
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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useGetNewsQuery({});
  const items: any[] = data?.data?.content ?? data?.data ?? data?.content ?? [];

  const pinned = items.find((i: any) => i.isPinned || i.pinned);
  const regular = items.filter((i: any) => !i.isPinned && !i.pinned);

  return (
    <CabinetLayout title="Новости">
      <div className="max-w-5xl space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-[#1A1A1A]">Новости</h2>
          <p className="text-sm text-[#9B9589] mt-1">Объявления, акции и изменения условий программы.</p>
        </div>

        {isLoading && (
          <p className="text-center text-[#9B9589] text-xs font-bold animate-pulse uppercase tracking-widest py-16">Загрузка...</p>
        )}

        {!isLoading && items.length === 0 && (
          <div className="bg-white border border-[#E5DDD0] rounded-3xl p-16 text-center">
            <p className="text-[#9B9589] text-sm">Новостей пока нет</p>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <div className="space-y-6">
            {pinned && <FeaturedCard item={pinned} onClick={() => setSelectedId(pinned.id)} />}
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

      {selectedId && <NewsModal id={selectedId} onClose={() => setSelectedId(null)} />}
    </CabinetLayout>
  );
}
