import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark, Send, ChevronLeft, ChevronRight, X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { get, post as apiPost, del } from '@/lib/api';
import CommentItem from '@/components/CommentItem';
import type { Post, Comment } from '@/types';

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

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [doubleTapHeart, setDoubleTapHeart] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!postId) return;
    try {
      const res = await get<{ success: boolean; data: any }>(`/posts/${postId}`);
      const p = res.data;
      setPost({
        id: p.id,
        userId: p.user_id,
        user: {
          id: p.user_id,
          username: p.username,
          email: '',
          avatar: p.avatar || `https://picsum.photos/seed/${p.user_id}/200/200`,
          bio: '',
          coverImage: '',
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          isVerified: !!p.is_verified,
        },
        content: p.content,
        images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []),
        likesCount: p.like_count || 0,
        commentsCount: p.comment_count || 0,
        sharesCount: p.share_count || 0,
        isLiked: !!p.is_liked,
        isBookmarked: !!p.is_bookmarked,
        isOwner: !!p.is_owner,
        tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : (p.tags || []),
        location: p.location || null,
        createdAt: p.created_at,
      });
    } catch {
      navigate(-1);
    }
    setIsLoading(false);
  }, [postId, navigate]);

  const fetchComments = useCallback(async (page: number, append: boolean = false) => {
    if (!postId) return;
    setIsLoadingComments(true);
    try {
      const res = await get<{ success: boolean; data: { comments: any[]; pagination: { totalPages: number } } }>(`/comments/post/${postId}?page=${page}&limit=20`);
      const mapped = (res.data?.comments || []).map((c: any) => ({
        id: c.id,
        postId: c.post_id,
        user: {
          id: c.user_id,
          username: c.username,
          email: '',
          avatar: c.avatar || `https://picsum.photos/seed/${c.user_id}/200/200`,
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
      if (append) {
        setComments((prev) => [...prev, ...mapped]);
      } else {
        setComments(mapped);
      }
      const pagination = res.data?.pagination;
      setHasMoreComments(pagination ? page < pagination.totalPages : mapped.length >= 20);
    } catch {}
    setIsLoadingComments(false);
  }, [postId]);

  useEffect(() => {
    fetchPost();
    fetchComments(1);
  }, [fetchPost, fetchComments]);

  const handleLike = async () => {
    if (!post) return;
    const prevLiked = post.isLiked;
    setPost((prev) => prev ? { ...prev, isLiked: !prevLiked, likesCount: prevLiked ? prev.likesCount - 1 : prev.likesCount + 1 } : prev);
    try {
      if (prevLiked) {
        await del(`/posts/${post.id}/like`);
      } else {
        await apiPost(`/posts/${post.id}/like`);
      }
    } catch {}
  };

  const handleBookmark = async () => {
    if (!post) return;
    const prevBookmarked = post.isBookmarked;
    setPost((prev) => prev ? { ...prev, isBookmarked: !prevBookmarked } : prev);
    try {
      if (prevBookmarked) {
        await del(`/posts/${post.id}/bookmark`);
      } else {
        await apiPost(`/posts/${post.id}/bookmark`);
      }
    } catch {}
  };

  const handleDoubleClick = () => {
    if (!post || post.isLiked) return;
    setDoubleTapHeart(true);
    setTimeout(() => setDoubleTapHeart(false), 800);
    handleLike();
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !postId) return;
    const text = commentText.trim();
    setCommentText('');
    try {
      const res = await apiPost<{ success: boolean; data: any }>(`/comments/post/${postId}`, { content: text });
      const c = res.data;
      const newComment: Comment = {
        id: c.id,
        postId: c.post_id || postId,
        user: {
          id: c.user_id || currentUser?.id || '',
          username: c.username || currentUser?.username || '我',
          email: '',
          avatar: c.avatar || currentUser?.avatar || '',
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
      setPost((prev) => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : prev);
    } catch {}
  };

  const loadMoreComments = () => {
    const nextPage = commentsPage + 1;
    setCommentsPage(nextPage);
    fetchComments(nextPage, true);
  };

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
  };

  const closeLightbox = () => {
    setLightboxIndex(-1);
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="animate-shimmer h-64 rounded-2xl mb-4" />
        <div className="animate-shimmer h-4 w-32 mb-2" />
        <div className="animate-shimmer h-3 w-48" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-all">
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <div className="flex items-center gap-3 flex-1" onClick={() => navigate(`/profile/${post.userId}`)}>
          <img
            src={post.user.avatar}
            alt={post.user.username}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-100 dark:ring-primary-900/30 cursor-pointer"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{post.user.username}</p>
              {post.user.isVerified && (
                <span className="w-4 h-4 rounded-full bg-primary-500 text-white flex items-center justify-center text-[8px]">✓</span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatTime(post.createdAt)}</p>
          </div>
        </div>
      </div>

      <div onDoubleClick={handleDoubleClick} className="relative select-none">
        {post.content && (
          <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        )}

        {post.images.length > 0 && (
          <div className={cn('grid gap-1 rounded-xl overflow-hidden mb-3', post.images.length === 1 ? 'grid-cols-1' : post.images.length <= 3 ? 'grid-cols-2' : 'grid-cols-2')}>
            {post.images.map((img, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden cursor-pointer"
                style={{ aspectRatio: post.images.length === 1 ? '16/10' : '1/1' }}
                onClick={() => openLightbox(idx)}
              >
                <img src={img} alt="" className="w-full h-full object-cover hover:opacity-90 transition-opacity duration-200" />
              </div>
            ))}
          </div>
        )}

        {doubleTapHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Heart className="w-24 h-24 text-primary-500 fill-primary-500 animate-heartBeat drop-shadow-lg" />
          </div>
        )}
      </div>

      {(post.tags.length > 0 || post.location) && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {post.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => navigate(`/topic/${tag}`)}
              className="px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-xs text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all"
            >
              #{tag}
            </button>
          ))}
          {post.location && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin className="w-3 h-3" />
              {post.location}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 dark:border-dark-700">
        <button
          onClick={handleLike}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200',
            post.isLiked
              ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
          )}
        >
          <Heart className={cn('w-5 h-5', post.isLiked && 'fill-current')} />
          <span>{post.likesCount > 0 ? post.likesCount : '赞'}</span>
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-500 dark:text-gray-400">
          <MessageCircle className="w-5 h-5" />
          <span>{post.commentsCount > 0 ? post.commentsCount : '评论'}</span>
        </div>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200">
          <Share2 className="w-5 h-5" />
          <span>{post.sharesCount > 0 ? post.sharesCount : '分享'}</span>
        </button>

        <button
          onClick={handleBookmark}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200',
            post.isBookmarked
              ? 'text-warm-600 bg-warm-50 dark:bg-warm-900/20'
              : 'text-gray-500 dark:text-gray-400 hover:text-warm-600 hover:bg-warm-50 dark:hover:bg-warm-900/20'
          )}
        >
          <Bookmark className={cn('w-5 h-5', post.isBookmarked && 'fill-current')} />
        </button>
      </div>

      <div className="mt-4">
        <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-3">评论 ({post.commentsCount})</h3>

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

        {hasMoreComments && comments.length > 0 && (
          <button
            onClick={loadMoreComments}
            className="w-full py-3 text-sm text-primary-500 hover:text-primary-600 transition-colors"
          >
            加载更多评论
          </button>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:bottom-auto md:sticky md:bottom-4 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-600 p-3 z-20 md:rounded-2xl md:shadow-lg md:border">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
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

      {lightboxIndex >= 0 && post.images.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center animate-fadeIn" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-10">
            <X className="w-6 h-6" />
          </button>
          {post.images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev > 0 ? prev - 1 : post.images.length - 1)); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          <img
            src={post.images[lightboxIndex]}
            alt=""
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {post.images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev < post.images.length - 1 ? prev + 1 : 0)); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightboxIndex + 1} / {post.images.length}
          </div>
        </div>
      )}
    </div>
  );
}
