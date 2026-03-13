"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    MessageCircle, ThumbsUp, Send, Search, Tag, Flame,
    Clock, TrendingUp, ChevronDown, ChevronUp, Trash2, Pencil, Check,
    Eye, Users, HelpCircle, X, Plus, AlertCircle, ImagePlus, ZoomIn
} from 'lucide-react';
import styles from './page.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Post {
    _id: string;
    title: string;
    content: string;
    authorName: string;
    author: string;
    tags: string[];
    likeCount: number;
    likes: string[];
    views: number;
    replyCount: number;
    imageUrl: string | null;
    createdAt: string;
}

interface Reply {
    _id: string;
    content: string;
    authorName: string;
    author: string;
    likeCount: number;
    likes: string[];
    isExpertAnswer: boolean;
    createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function avatarColor(name: string): string {
    const colors = ['#2d6a4f', '#1b4332', '#52b788', '#d4a373', '#b58d04', '#40916c', '#74c69d'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

// ─── API Helpers ──────────────────────────────────────────────────────────────

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}

function getUserInfo(): { _id: string; name: string } | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('userInfo');
    return raw ? JSON.parse(raw) : null;
}

async function apiFetch(path: string, options: RequestInit = {}) {
    const token = getToken();
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };
    // Only set Content-Type JSON when NOT sending FormData
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
}

const POPULAR_TAGS = ['wheat', 'tomato', 'rice', 'pest', 'irrigation', 'soil', 'hydroponic', 'organic', 'disease', 'fertilizer'];

// ─── Reply Section ─────────────────────────────────────────────────────────────

function ReplySection({ postId, user }: { postId: string; user: ReturnType<typeof getUserInfo> }) {
    const [replies, setReplies] = useState<Reply[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set());

    useEffect(() => {
        apiFetch(`/community/${postId}/replies`)
            .then(data => {
                setReplies(data);
                // Mark already-liked
                if (user) {
                    const liked = new Set(
                        data.filter((r: Reply) => r.likes?.includes(user._id)).map((r: Reply) => r._id)
                    );
                    setLikedReplies(liked as Set<string>);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [postId, user]);

    const submitReply = async () => {
        if (!replyText.trim() || submitting) return;
        setSubmitting(true);
        try {
            const newReply = await apiFetch(`/community/${postId}/replies`, {
                method: 'POST',
                body: JSON.stringify({ content: replyText.trim() }),
            });
            setReplies(prev => [newReply, ...prev]);
            setReplyText('');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleLike = async (replyId: string) => {
        if (!user) return alert('Please log in to like replies');
        try {
            const result = await apiFetch(`/community/${postId}/replies/${replyId}/like`, { method: 'POST' });
            setReplies(prev =>
                prev.map(r => r._id === replyId ? { ...r, likeCount: result.likeCount } : r)
            );
            setLikedReplies(prev => {
                const next = new Set(prev);
                result.liked ? next.add(replyId) : next.delete(replyId);
                return next;
            });
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className={styles.replySection}>
            {/* Reply Form */}
            {user ? (
                <div className={styles.replyForm}>
                    <div className={styles.replyAvatar} style={{ background: avatarColor(user.name) }}>
                        {getInitials(user.name)}
                    </div>
                    <div className={styles.replyInputRow}>
                        <textarea
                            className={styles.replyTextarea}
                            placeholder="Share your knowledge or experience..."
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            rows={2}
                            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) submitReply(); }}
                        />
                        <button
                            className={styles.replySubmitBtn}
                            onClick={submitReply}
                            disabled={!replyText.trim() || submitting}
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            ) : (
                <p className={styles.loginPrompt}>
                    <AlertCircle size={14} /> Log in to add a reply
                </p>
            )}

            {/* Replies List */}
            {loading ? (
                <div className={styles.loadingReplies}>Loading replies...</div>
            ) : replies.length === 0 ? (
                <div className={styles.noReplies}>No replies yet — be the first to answer!</div>
            ) : (
                <div className={styles.repliesList}>
                    {replies.map(reply => (
                        <div key={reply._id} className={`${styles.replyCard} ${reply.isExpertAnswer ? styles.expertReply : ''}`}>
                            {reply.isExpertAnswer && (
                                <span className={styles.expertBadge}>⭐ Expert Answer</span>
                            )}
                            <div className={styles.replyHeader}>
                                <div className={styles.replyAuthorRow}>
                                    <div
                                        className={styles.replyAuthorAvatar}
                                        style={{ background: avatarColor(reply.authorName) }}
                                    >
                                        {getInitials(reply.authorName)}
                                    </div>
                                    <div>
                                        <span className={styles.replyAuthorName}>{reply.authorName}</span>
                                        <span className={styles.replyTime}>{timeAgo(reply.createdAt)}</span>
                                    </div>
                                </div>
                                <button
                                    className={`${styles.replyLikeBtn} ${likedReplies.has(reply._id) ? styles.liked : ''}`}
                                    onClick={() => toggleLike(reply._id)}
                                >
                                    <ThumbsUp size={13} />
                                    <span>{reply.likeCount}</span>
                                </button>
                            </div>
                            <p className={styles.replyContent}>{reply.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Post Card ─────────────────────────────────────────────────────────────────

function PostCard({
    post,
    user,
    onLike,
    onDelete,
    onEdit,
}: {
    post: Post;
    user: ReturnType<typeof getUserInfo>;
    onLike: (id: string, liked: boolean, count: number) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, updated: Partial<Post>) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [liked, setLiked] = useState(user ? post.likes?.includes(user._id) : false);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [likeAnim, setLikeAnim] = useState(false);
    const [viewed, setViewed] = useState(false);
    const [imgExpanded, setImgExpanded] = useState(false);

    // Edit state
    const [editing, setEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(post.title);
    const [editContent, setEditContent] = useState(post.content);
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState('');

    const handleExpand = () => {
        if (!expanded && !viewed) {
            apiFetch(`/community/${post._id}/view`, { method: 'POST' }).catch(() => { });
            setViewed(true);
        }
        setExpanded(e => !e);
    };

    const handleLike = async () => {
        if (!user) return alert('Please log in to like posts');
        try {
            const result = await apiFetch(`/community/${post._id}/like`, { method: 'POST' });
            setLiked(result.liked);
            setLikeCount(result.likeCount);
            setLikeAnim(true);
            setTimeout(() => setLikeAnim(false), 400);
            onLike(post._id, result.liked, result.likeCount);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this question?')) return;
        try {
            await apiFetch(`/community/${post._id}`, { method: 'DELETE' });
            onDelete(post._id);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const saveEdit = async () => {
        if (!editTitle.trim() || !editContent.trim()) {
            setEditError('Title and description cannot be empty.');
            return;
        }
        setEditSaving(true);
        setEditError('');
        try {
            const fd = new FormData();
            fd.append('title', editTitle.trim());
            fd.append('content', editContent.trim());
            const updated = await apiFetch(`/community/${post._id}`, {
                method: 'PUT',
                body: fd,
            });
            onEdit(post._id, { title: updated.title, content: updated.content });
            setEditing(false);
        } catch (err: any) {
            setEditError(err.message);
        } finally {
            setEditSaving(false);
        }
    };

    const IMAGE_BASE = 'http://localhost:5000';

    return (
        <div className={styles.postCard}>
            {/* Post Header */}
            <div className={styles.postHeader}>
                <div className={styles.authorRow}>
                    <div
                        className={styles.authorAvatar}
                        style={{ background: avatarColor(post.authorName) }}
                    >
                        {getInitials(post.authorName)}
                    </div>
                    <div>
                        <span className={styles.authorName}>{post.authorName}</span>
                        <span className={styles.postTime}>{timeAgo(post.createdAt)}</span>
                    </div>
                </div>
                {user && user._id === post.author && (
                    <div className={styles.ownerActions}>
                        {!editing && (
                            <button
                                onClick={() => { setEditing(true); setEditTitle(post.title); setEditContent(post.content); setEditError(''); }}
                                className={styles.editBtn}
                                title="Edit post"
                            >
                                <Pencil size={13} />
                            </button>
                        )}
                        {editing ? (
                            <button onClick={() => setEditing(false)} className={styles.cancelEditBtn} title="Cancel">
                                <X size={13} />
                            </button>
                        ) : (
                            <button onClick={handleDelete} className={styles.deleteBtn} title="Delete post">
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Title & Body — show edit form when editing, read view otherwise */}
            {editing ? (
                <div className={styles.editForm}>
                    <input
                        className={styles.editTitleInput}
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        placeholder="Question title"
                        maxLength={200}
                    />
                    <textarea
                        className={styles.editBodyTextarea}
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        rows={4}
                        placeholder="Describe the question..."
                    />
                    {editError && (
                        <p className={styles.editError}><AlertCircle size={13} /> {editError}</p>
                    )}
                    <div className={styles.editActions}>
                        <button className={styles.cancelEditBtn2} onClick={() => setEditing(false)}>Cancel</button>
                        <button
                            className={styles.saveEditBtn}
                            onClick={saveEdit}
                            disabled={editSaving}
                        >
                            <Check size={14} />
                            {editSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Title */}
                    <h3 className={styles.postTitle} onClick={handleExpand}>{post.title}</h3>

                    {/* Plant Image */}
                    {post.imageUrl && (
                        <div className={`${styles.postImageWrap} ${imgExpanded ? styles.postImageExpanded : ''}`}
                            onClick={() => setImgExpanded(v => !v)}>
                            <img
                                src={`${IMAGE_BASE}${post.imageUrl}`}
                                alt="Plant image"
                                className={styles.postImage}
                            />
                            <div className={styles.imageOverlay}>
                                <ZoomIn size={18} />
                            </div>
                        </div>
                    )}

                    {/* Body Preview */}
                    <p className={styles.postBody}>
                        {expanded ? post.content : post.content.slice(0, 180) + (post.content.length > 180 ? '...' : '')}
                    </p>
                </>
            )}

            {/* Tags */}
            {post.tags?.length > 0 && (
                <div className={styles.tagsRow}>
                    {post.tags.map(tag => (
                        <span key={tag} className={styles.tag}>
                            <Tag size={10} />{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className={styles.postActions}>
                <button
                    className={`${styles.actionBtn} ${styles.likeBtn} ${liked ? styles.liked : ''} ${likeAnim ? styles.likeAnim : ''}`}
                    onClick={handleLike}
                >
                    <ThumbsUp size={15} />
                    <span>{likeCount}</span>
                </button>

                <button className={`${styles.actionBtn} ${styles.replyBtn} ${expanded ? styles.active : ''}`} onClick={handleExpand}>
                    <MessageCircle size={15} />
                    <span>{post.replyCount} {post.replyCount === 1 ? 'Reply' : 'Replies'}</span>
                    {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                <span className={styles.viewCount}>
                    <Eye size={13} /> {post.views + (viewed ? 1 : 0)}
                </span>
            </div>

            {/* Reply Section */}
            {expanded && <ReplySection postId={post._id} user={user} />}
        </div>
    );
}

// ─── Main Community Page ──────────────────────────────────────────────────────

export default function CommunityPage() {
    const [user, setUser] = useState<ReturnType<typeof getUserInfo>>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTag, setActiveTag] = useState('all');
    const [sort, setSort] = useState('newest');

    // Ask form
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    // Image upload state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setUser(getUserInfo());
    }, []);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (activeTag !== 'all') params.set('tag', activeTag);
            if (sort !== 'newest') params.set('sort', sort === 'likes' ? 'likes' : sort === 'replies' ? 'replies' : 'views');
            const data = await apiFetch(`/community?${params.toString()}`);
            setPosts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [search, activeTag, sort]);

    useEffect(() => {
        const t = setTimeout(fetchPosts, 300);
        return () => clearTimeout(t);
    }, [fetchPosts]);

    const addTag = (tag: string) => {
        const clean = tag.trim().toLowerCase();
        if (clean && !selectedTags.includes(clean) && selectedTags.length < 5) {
            setSelectedTags(prev => [...prev, clean]);
        }
        setTagInput('');
    };

    const removeTag = (tag: string) => setSelectedTags(prev => prev.filter(t => t !== tag));

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 8 * 1024 * 1024) {
            setFormError('Image must be under 8MB');
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setFormError('');
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const submitQuestion = async () => {
        if (!title.trim() || !content.trim()) {
            setFormError('Title and description are required.');
            return;
        }
        setSubmitting(true);
        setFormError('');
        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('content', content.trim());
            selectedTags.forEach(t => formData.append('tags', t));
            if (imageFile) formData.append('image', imageFile);

            const newPost = await apiFetch('/community', {
                method: 'POST',
                body: formData,
            });
            setPosts(prev => [newPost, ...prev]);
            setTitle('');
            setContent('');
            setSelectedTags([]);
            setTagInput('');
            removeImage();
            setShowForm(false);
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = (id: string, liked: boolean, count: number) => {
        setPosts(prev =>
            prev.map(p => p._id === id ? { ...p, likeCount: count } : p)
        );
    };

    const handleDelete = (id: string) => {
        setPosts(prev => prev.filter(p => p._id !== id));
    };

    const totalLikes = posts.reduce((sum, p) => sum + (p.likeCount || 0), 0);

    return (
        <div className={styles.page}>
            {/* ── Hero Header ── */}
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.heroBadge}><HelpCircle size={14} /> Expert Community</div>
                    <h1 className={styles.heroTitle}>Ask. Answer. Grow Together.</h1>
                    <p className={styles.heroSub}>
                        Connect with farmers and agricultural experts. Share knowledge, solve problems.
                    </p>
                    <div className={styles.heroStats}>
                        <div className={styles.statItem}><Users size={16} /><span>{posts.length} Questions</span></div>
                        <div className={styles.statItem}><MessageCircle size={16} /><span>{posts.reduce((s, p) => s + p.replyCount, 0)} Answers</span></div>
                        <div className={styles.statItem}><ThumbsUp size={16} /><span>{totalLikes} Votes</span></div>
                    </div>
                    {user ? (
                        <button className={styles.askBtn} onClick={() => setShowForm(v => !v)}>
                            <Plus size={16} />
                            {showForm ? 'Cancel' : 'Ask a Question'}
                        </button>
                    ) : (
                        <p className={styles.loginHint}>
                            <a href="/login" className={styles.loginLink}>Log in</a> to ask a question or reply
                        </p>
                    )}
                </div>
            </div>

            <div className={styles.main}>
                {/* ── Ask Form ── */}
                {showForm && user && (
                    <div className={styles.askForm}>
                        <h3 className={styles.formTitle}>Ask a Question</h3>

                        <label className={styles.label}>Title <span className={styles.required}>*</span></label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="e.g. Why are my tomato leaves turning yellow?"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            maxLength={200}
                        />

                        <label className={styles.label}>Description <span className={styles.required}>*</span></label>
                        <textarea
                            className={styles.textarea}
                            placeholder="Describe your question in detail — include crop type, symptoms, location, season..."
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            rows={5}
                        />

                        <label className={styles.label}>Tags <span className={styles.tagHint}>(max 5)</span></label>
                        <div className={styles.tagInputRow}>
                            <input
                                className={styles.tagInput}
                                placeholder="Add a tag and press Enter"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                            />
                        </div>
                        {/* Quick Tag Picks */}
                        <div className={styles.quickTags}>
                            {POPULAR_TAGS.map(t => (
                                <button
                                    key={t}
                                    className={`${styles.quickTag} ${selectedTags.includes(t) ? styles.quickTagActive : ''}`}
                                    onClick={() => selectedTags.includes(t) ? removeTag(t) : addTag(t)}
                                    type="button"
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        {/* Selected Tags */}
                        {selectedTags.length > 0 && (
                            <div className={styles.selectedTags}>
                                {selectedTags.map(t => (
                                    <span key={t} className={styles.selectedTag}>
                                        {t}
                                        <button onClick={() => removeTag(t)} className={styles.removeTag}><X size={10} /></button>
                                    </span>
                                ))}
                            </div>
                        )}
                        {/* Image Upload */}
                        <label className={styles.label}>Plant Photo <span className={styles.tagHint}>(optional, max 8MB)</span></label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className={styles.fileInput}
                            onChange={handleImageChange}
                        />
                        {imagePreview ? (
                            <div className={styles.imagePreviewWrap}>
                                <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                                <button className={styles.removeImageBtn} onClick={removeImage} type="button">
                                    <X size={14} /> Remove
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className={styles.uploadTrigger}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <ImagePlus size={18} />
                                <span>Click to upload a plant photo</span>
                                <span className={styles.uploadHint}>jpg, png, webp, gif — max 8MB</span>
                            </button>
                        )}

                        {formError && <p className={styles.formError}><AlertCircle size={14} /> {formError}</p>}


                        <div className={styles.formActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
                            <button
                                className={styles.submitBtn}
                                onClick={submitQuestion}
                                disabled={submitting || !title.trim() || !content.trim()}
                            >
                                {submitting ? 'Posting...' : <><Send size={14} /> Post Question</>}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Controls ── */}
                <div className={styles.controls}>
                    <div className={styles.searchBar}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            className={styles.searchInput}
                            placeholder="Search questions..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className={styles.clearSearch} onClick={() => setSearch('')}><X size={14} /></button>
                        )}
                    </div>

                    <div className={styles.sortTabs}>
                        {[
                            { key: 'newest', label: 'Newest', icon: <Clock size={13} /> },
                            { key: 'likes', label: 'Top Liked', icon: <Flame size={13} /> },
                            { key: 'replies', label: 'Most Active', icon: <TrendingUp size={13} /> },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                className={`${styles.sortTab} ${sort === tab.key ? styles.sortActive : ''}`}
                                onClick={() => setSort(tab.key)}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Tag Filter Chips ── */}
                <div className={styles.tagFilter}>
                    <button
                        className={`${styles.tagChip} ${activeTag === 'all' ? styles.tagChipActive : ''}`}
                        onClick={() => setActiveTag('all')}
                    >All</button>
                    {POPULAR_TAGS.map(tag => (
                        <button
                            key={tag}
                            className={`${styles.tagChip} ${activeTag === tag ? styles.tagChipActive : ''}`}
                            onClick={() => setActiveTag(activeTag === tag ? 'all' : tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* ── Feed ── */}
                <div className={styles.feed}>
                    {loading ? (
                        <div className={styles.loadingState}>
                            {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className={styles.emptyState}>
                            <HelpCircle size={48} className={styles.emptyIcon} />
                            <h3>No questions found</h3>
                            <p>
                                {search || activeTag !== 'all'
                                    ? 'Try a different search or tag.'
                                    : 'Be the first to ask a question!'}
                            </p>
                        </div>
                    ) : (
                        posts.map(post => (
                            <PostCard
                                key={post._id}
                                post={post}
                                user={user}
                                onLike={handleLike}
                                onDelete={handleDelete}
                                onEdit={(id, updated) => setPosts(prev =>
                                    prev.map(p => p._id === id ? { ...p, ...updated } : p)
                                )}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
