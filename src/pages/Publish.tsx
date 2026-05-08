import { useState, useRef } from 'react';
import { Image, Smile, Hash, MapPin, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function Publish() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = () => {
    const newImages = [
      ...images,
      `https://picsum.photos/seed/upload${Date.now()}/400/400`,
    ];
    setImages(newImages.slice(0, 9));
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    navigate('/');
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4 md:hidden">
        <button onClick={() => navigate(-1)} className="text-gray-500 text-sm">取消</button>
        <h1 className="font-display text-lg font-bold text-gray-900 dark:text-white">发布动态</h1>
        <div className="w-8" />
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-600">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="分享你此刻的想法..."
          rows={6}
          className="w-full resize-none bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none text-base leading-relaxed"
        />

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {images.length < 9 && (
              <button
                onClick={handleImageUpload}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-600 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:border-primary-500 transition-all"
              >
                <Image className="w-6 h-6" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-dark-700">
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-gray-500 hover:bg-primary-50 hover:text-primary-500 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-all"
            >
              <Image className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-xl text-gray-500 hover:bg-warm-50 hover:text-warm-600 dark:hover:bg-warm-900/20 dark:hover:text-warm-400 transition-all">
              <Smile className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-xl text-gray-500 hover:bg-mint-50 hover:text-mint-600 dark:hover:bg-mint-900/20 dark:hover:text-mint-400 transition-all">
              <Hash className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-xl text-gray-500 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-all">
              <MapPin className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className={cn('text-xs', content.length > 500 ? 'text-red-500' : 'text-gray-400')}>
              {content.length}/500
            </span>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!content.trim() && images.length === 0)}
              className={cn(
                'px-6 py-2 rounded-full text-sm font-medium transition-all duration-200',
                'bg-gradient-to-r from-primary-500 to-primary-600 text-white',
                'hover:shadow-lg hover:shadow-primary-200 dark:hover:shadow-primary-900/30',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
                'flex items-center gap-2'
              )}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? '发布中...' : '发布'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
