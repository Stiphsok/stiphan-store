import React, { useState, useRef } from 'react';
import { X, Check, Link as LinkIcon, Search, Sparkles, Upload } from 'lucide-react';
import { PRESET_IMAGES } from '../data/presets';
import { PresetImage } from '../types/game';
import { sound } from '../utils/sound';

interface GalleryModalProps {
  isOpen: boolean;
  currentUrl: string;
  onSelectImage: (preset: PresetImage) => void;
  onCustomUrl: (url: string, name: string) => void;
  onUploadFile?: (file: File) => void;
  onClose: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  currentUrl,
  onSelectImage,
  onCustomUrl,
  onUploadFile,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlForm, setShowUrlForm] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'morocco', label: '🇲🇦 المغرب' },
    { id: 'sports', label: '⚽ رياضة' },
    { id: 'food', label: '🍲 شهيوات' },
    { id: 'anime', label: '🎨 أنمي' },
    { id: 'nature', label: '🦁 طبيعة' },
  ];

  const filtered = PRESET_IMAGES.filter((img) => {
    const matchesCat = selectedCategory === 'all' || img.category === selectedCategory;
    const matchesQuery = img.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    sound.playClick();
    onCustomUrl(customUrlInput.trim(), 'صورة مخصصة من الرابط');
    setCustomUrlInput('');
    setShowUrlForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#1b263b] border-2 border-[#fca311] rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/80 bg-[#121c2d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#fca311] text-black font-black flex items-center justify-center text-base">
              🖼️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#fca311]">
                كتالوج صور سطيفان
              </h2>
              <p className="text-[11px] text-slate-300">
                اختر صورتك المفضلة لبدء التحدي
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & URL Input Bar */}
        <div className="p-3 bg-[#172235] border-b border-slate-700/60 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="ابحث عن صورة (ميسي، طاجين، شفشاون...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d1b2a] border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#fca311]"
              />
            </div>
            {onUploadFile && (
              <label className="px-3 py-2 text-xs font-bold rounded-xl bg-[#2a9d8f] hover:bg-[#238276] text-white border border-teal-400/40 flex items-center gap-1 shrink-0 cursor-pointer shadow-sm active:scale-95 transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>رفع صورة</span>
                <input
                  ref={galleryFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      sound.playClick();
                      onUploadFile(file);
                      onClose();
                    }
                  }}
                />
              </label>
            )}
            <button
              onClick={() => setShowUrlForm(!showUrlForm)}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600 flex items-center gap-1 shrink-0"
            >
              <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>رابط صورة</span>
            </button>
          </div>

          {/* Paste URL Input Form */}
          {showUrlForm && (
            <form onSubmit={handleApplyUrl} className="flex gap-2 pt-1 animate-fadeIn">
              <input
                type="url"
                placeholder="ألصق رابط صورة (URL) مباشر..."
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 bg-[#0d1b2a] border border-cyan-500/50 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#2a9d8f] text-white text-xs font-bold rounded-xl hover:bg-[#238276] shrink-0"
              >
                تطبيق
              </button>
            </form>
          )}

          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#fca311] text-black shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Images Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((item) => {
            const isSelected = item.url === currentUrl;
            return (
              <div
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  onSelectImage(item);
                  onClose();
                }}
                className={`group relative rounded-2xl overflow-hidden aspect-square border-2 cursor-pointer transition-all hover:scale-102 ${
                  isSelected
                    ? 'border-[#fca311] ring-2 ring-[#fca311]/50 shadow-lg'
                    : 'border-slate-700/80 hover:border-slate-500'
                }`}
              >
                <img
                  src={item.url}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Dark Gradient Overlay for title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-right">
                  <span className="text-[10px] text-amber-300 font-bold block mb-0.5">
                    {item.categoryLabel}
                  </span>
                  <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#fca311] transition-colors">
                    {item.name}
                  </h4>
                </div>

                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-2 left-2 bg-[#fca311] text-black p-1 rounded-full shadow-md">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-700/80 bg-[#121c2d] text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#fca311]" />
          <span>يمكنك أيضاً رفع أي صورة من هاتفك أو كاميرتك مباشرة!</span>
        </div>
      </div>
    </div>
  );
};
