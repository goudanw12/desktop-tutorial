import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { post as apiPost, get, del } from '@/lib/api';
import CommentItem from './CommentItem';
import type { Post, Comment } from '@/types';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onUpdate?: (postId: string, updates: Partial<Post>) => void;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

export default function PostCard({ post, onLike, onBookmark, onUpdate }: PostCardProps) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [heartAnim, setHeartAnim] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [sharesCount, setSharesCount] = useState(post.sharesCount);

  const handleLike = async () => {
    const prevLiked = isLiked;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? likesCount - 1 : likesCount + 1);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 600);
    onLike?.(post.id);
    try {
      if (prevLiked) {
        await del(`/posts/${post.id}/like`);
      } else {
        await apiPost(`/posts/${post.id}/like`);
      }
    } catch {}
  };

  const handleBookmark = async () => {
    const prevBookmarked = isBookmarked;
    setIsBookmarked(!prevBookmarked);
    onBookmark?.(post.id);
    try {
      if (prevBookmarked) {
        await del(`/posts/${post.id}/bookmark`);
      } else {
        await apiPost(`/posts/${post.id}/bookmark`);
      }
    } catch {}
  };

  const handleOpenComments = async () => {
    setShowComments(true);
    if (comments.length === 0) {
      setIsLoadingComments(true);
      try {
        const res = await get<{ success: boolean; data: { comments: any[] } }>(`/comments/post/${post.id}`);
        const mapped = (res.data?.comments || []).map((c: any) => ({
          id: c.id,
          postId: c.post_id,
          user: {
            id: c.user_id,
            username: c.username,
            email: '',
            avatar: c.avatar || '',
            bio: '',
            coverImage: '',
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            isVerified: !!c.is_verified,
          },
          content: c.content,
          likesCount: c.like_count || 0,
          isLiked: false,
          createdAt: c.created_at,
        }));
        setComments(mapped);
      } catch {
        setComments([]);
      }
      setIsLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    const text = commentText.trim();
    setCommentText('');
    try {
      const res = await apiPost<{ success: boolean; data: any }>(`/comments/post/${post.id}`, { content: text });
      const c = res.data;
      const newComment: Comment = {
        id: c.id,
        postId: c.post_id || post.id,
        user: {
          id: c.user_id || '',
          username: c.username || '我',
          email: '',
          avatar: c.avatar || '',
          bio: '',
          coverImage: '',
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          isVerified: !!c.is_verified,
        },
        content: c.content || text,
        likesCount: 0,
        isLiked: false,
        createdAt: c.created_at || new Date().toISOString(),
      };
      setComments((prev) => [newComment, ...prev]);
      onUpdate?.(post.id, { commentsCount: post.commentsCount + 1 });
    } catch {
      const newComment: Comment = {
        id: Date.now().toString(),
        postId: post.id,
        user: { id: '', username: '我', email: '', avatar: '', bio: '', coverImage: '', followersCount: 0, followingCount: 0, postsCount: 0 },
        content: text,
        likesCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => [newComment, ...prev]);
      onUpdate?.(post.id, { commentsCount: post.commentsCount + 1 });
    }
  };

  const handleShare = (method: string) => {
    setSharesCount((prev) => prev + 1);
    onUpdate?.(post.id, { sharesCount: post.sharesCount + 1 });
    setShowShare(false);
    if (method === 'copy') {
      navigator.clipboard?.writeText(window.location.origin + `/post/${post.id}`);
    }
  };

  const imageGridClass = (count: number) => {
    if (count === 1) return 'grid-cols-1 max-h-80';
    if (count === 2) return 'grid-cols-2 max-h-64';
    if (count === 3) return 'grid-cols-3 max-h-64';
    return 'grid-cols-2 max-h-80';
  };

  return (
    <>
      <article className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-600 animate-fadeIn">
        <div
          className="flex items-center gap-3 mb-3 cursor-pointer"
          onClick={() => navigate(`/profile/${post.userId}`)}
        >
          <img
            src={post.user.avatar}
            alt={post.user.username}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-100 dark:ring-primary-900/30"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{post.user.username}</p>
              {post.user.isVerified && (
                <span className="w-4 h-4 rounded-full bg-primary-500 text-white flex items-center justify-center text-[8px]">✓</span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatTime(post.createdAt)}</p>
          </div>
        </div>

        {post.content && (
          <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {post.images.length > 0 && (
          <div className={cn('grid gap-1 rounded-xl overflow-hidden mb-3', imageGridClass(post.images.length))}>
            {post.images.slice(0, 4).map((img, idx) => (
              <div key={idx} className="relative aspect-square overflow-hidden">
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {idx === 3 && post.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">+{post.images.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-dark-700">
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200',
              isLiked
                ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
            )}
          >
            <Heart
              className={cn(
                'w-4.5 h-4.5 transition-all',
                isLiked && 'fill-current',
                heartAnim && 'animate-heartBeat'
              )}
            />
            <span>{likesCount > 0 ? likesCount : '赞'}</span>
          </button>

          <button
            onClick={handleOpenComments}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-500 dark:text-gray-400 hover:text-mint-500 hover:bg-mint-50 dark:hover:bg-mint-900/20 transition-all duration-200"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            <span>{post.commentsCount > 0 ? post.commentsCount : '评论'}</span>
          </button>

          <button
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
          >
            <Share2 className="w-4.5 h-4.5" />
            <span>{sharesCount > 0 ? sharesCount : '分享'}</span>
          </button>

          <button
            onClick={handleBookmark}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200',
              isBookmarked
                ? 'text-warm-600 bg-warm-50 dark:bg-warm-900/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-warm-600 hover:bg-warm-50 dark:hover:bg-warm-900/20'
            )}
          >
            <Bookmark className={cn('w-4.5 h-4.5', isBookmarked && 'fill-current')} />
          </button>
        </div>
      </article>

      {showComments && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center" onClick={() => setShowComments(false)}>
          <div
            className="bg-white dark:bg-dark-800 w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[80vh] flex flex-col animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-600">
              <h3 className="font-display font-semibold text-gray-900 dark:text-white">评论</h3>
              <button onClick={() => setShowComments(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingComments ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">暂无评论，来说点什么吧～</div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-dark-700">
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-dark-600">
              <div className="flex items-center gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmitComment()}
                  placeholder="写下你的评论..."
                  className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 dark:bg-dark-700 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim()}
                  className="p-2.5 rounded-full bg-primary-500 text-white disabled:opacity-40 hover:bg-primary-600 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showShare && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center" onClick={() => setShowShare(false)}>
          <div
            className="bg-white dark:bg-dark-800 w-full md:max-w-sm md:rounded-2xl rounded-t-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-600">
              <h3 className="font-display font-semibold text-gray-900 dark:text-white">分享</h3>
              <button onClick={() => setShowShare(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => handleShare('copy')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
              >
                <span className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-600 flex items-center justify-center text-lg">🔗</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">复制链接</span>
              </button>
              <button
                onClick={() => handleShare('wechat')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
              >
                <span className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-lg">💬</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">分享到微信</span>
              </button>
              <button
                onClick={() => handleShare('weibo')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
              >
                <span className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-lg">📢</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">分享到微博</span>
              </button>
              <button
                onClick={() => handleShare('qq')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
              >
                <span className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-lg">🐧</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">分享到QQ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
