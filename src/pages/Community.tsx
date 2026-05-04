import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  User,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout } from '../components/PageLayout';
import { usePageTitle } from '../hooks/usePageTitle';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Comment {
  id: string;
  author: string;
  user_id: string;
  timeAgo: string;
  text: string;
  upvotes: number;
  userVote: 'up' | 'down' | null;
}

interface Post {
  id: string;
  author: string;
  user_id: string;
  timeAgo: string;
  topic: string;
  title: string;
  body: string;
  upvotes: number;
  userVote: 'up' | 'down' | null;
  comments: Comment[];
}

const TOPICS = ['Grammar Help', 'Pronunciation', 'Culture Exchange', 'Study Tips'];

const SUGGESTED_QUESTIONS = [
  'How do I conjugate ser vs estar?',
  'What is the difference between por and para?',
  'How do you roll your R\'s in Spanish?',
  'When do I use subjunctive mood?',
  'How to pronounce the ñ sound?',
  'What are the most common irregular verbs?',
  'Difference between tú and usted?',
  'How to use reflexive verbs in Spanish?',
  'Tips for learning Spanish vocabulary fast?',
  'How do accent marks change word meaning?',
  'Best way to practice Spanish conversation?',
  'How to order food in Spanish?',
];

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const SEED_POSTS: Post[] = [
  {
    id: 'seed-1',
    author: 'u/SpanishLearner99',
    user_id: '',
    timeAgo: '4 hours ago',
    topic: 'Pronunciation',
    title: 'How do you pronounce the double R (rr) correctly?',
    body: "I've been practicing for weeks but I still can't seem to roll my R's properly. Words like \"perro\" and \"carro\" sound terrible when I say them. Any tips or exercises that worked for you?",
    upvotes: 124,
    userVote: null,
    comments: [
      {
        id: 'seed-c1',
        author: 'u/NativeSpeaker_Madrid',
        user_id: '',
        timeAgo: '3 hours ago',
        text: "Try saying \"butter\" or \"ladder\" in an American accent really fast. The position your tongue hits the roof of your mouth for the 'tt' or 'dd' is exactly where it needs to be for the Spanish R. Start there, then try to push more air to make it vibrate.",
        upvotes: 89,
        userVote: null,
      },
    ],
  },
  {
    id: 'seed-2',
    author: 'u/GrammarNerd',
    user_id: '',
    timeAgo: '1 day ago',
    topic: 'Grammar Help',
    title: 'Por vs Para - The ultimate cheat sheet',
    body: '',
    upvotes: 56,
    userVote: null,
    comments: [],
  },
];

export function Community() {
  usePageTitle('Community');
  const { t, showInstructions } = useLanguage();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [newPostTopic, setNewPostTopic] = useState('Grammar Help');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [selectedTopic, setSelectedTopic] = useState<string>('All Topics');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    const { data: dbPosts } = await supabase
      .from('community_posts')
      .select('id, user_id, author_name, topic, title, body, upvotes, created_at')
      .order('created_at', { ascending: false });

    if (!dbPosts || dbPosts.length === 0) {
      setPosts(SEED_POSTS);
      setLoading(false);
      return;
    }

    const postIds = dbPosts.map(p => p.id);
    const { data: dbComments } = await supabase
      .from('community_comments')
      .select('id, post_id, user_id, author_name, body, upvotes, created_at')
      .in('post_id', postIds)
      .order('created_at', { ascending: true });

    const commentsByPost = new Map<string, Comment[]>();
    (dbComments || []).forEach((c: any) => {
      const arr = commentsByPost.get(c.post_id) || [];
      arr.push({
        id: c.id,
        author: c.author_name,
        user_id: c.user_id,
        timeAgo: timeAgo(c.created_at),
        text: c.body,
        upvotes: c.upvotes,
        userVote: null,
      });
      commentsByPost.set(c.post_id, arr);
    });

    const mapped: Post[] = dbPosts.map((p: any) => ({
      id: p.id,
      author: p.author_name,
      user_id: p.user_id,
      timeAgo: timeAgo(p.created_at),
      topic: p.topic,
      title: p.title,
      body: p.body,
      upvotes: p.upvotes,
      userVote: null,
      comments: commentsByPost.get(p.id) || [],
    }));

    setPosts([...mapped, ...SEED_POSTS]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostVote = (postId: string, voteType: 'up' | 'down') => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        let newUpvotes = post.upvotes;
        let newUserVote: 'up' | 'down' | null = voteType;
        if (post.userVote === voteType) {
          newUserVote = null;
          newUpvotes += voteType === 'up' ? -1 : 1;
        } else if (post.userVote) {
          newUpvotes += voteType === 'up' ? 2 : -2;
        } else {
          newUpvotes += voteType === 'up' ? 1 : -1;
        }
        return { ...post, upvotes: newUpvotes, userVote: newUserVote };
      })
    );
  };

  const handleCommentVote = (postId: string, commentId: string, voteType: 'up' | 'down') => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: post.comments.map((comment) => {
            if (comment.id !== commentId) return comment;
            let newUpvotes = comment.upvotes;
            let newUserVote: 'up' | 'down' | null = voteType;
            if (comment.userVote === voteType) {
              newUserVote = null;
              newUpvotes += voteType === 'up' ? -1 : 1;
            } else if (comment.userVote) {
              newUpvotes += voteType === 'up' ? 2 : -2;
            } else {
              newUpvotes += voteType === 'up' ? 1 : -1;
            }
            return { ...comment, upvotes: newUpvotes, userVote: newUserVote };
          }),
        };
      })
    );
  };

  const handleSubmitPost = async () => {
    if (!newPostTitle.trim() || !newPostBody.trim()) return;
    if (!user) {
      setPostError('You must be logged in to post.');
      return;
    }
    setPostError(null);
    const authorName = user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous';

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: user.id,
        author_name: `u/${authorName}`,
        topic: newPostTopic,
        title: newPostTitle.trim(),
        body: newPostBody.trim(),
      })
      .select('id, user_id, author_name, topic, title, body, upvotes, created_at')
      .single();

    if (error) {
      setPostError(error.message || 'Failed to create post. Please try again.');
      return;
    }
    if (!data) {
      setPostError('Failed to create post. Please try again.');
      return;
    }

    const newPost: Post = {
      id: data.id,
      author: data.author_name,
      user_id: data.user_id,
      timeAgo: 'Just now',
      topic: data.topic,
      title: data.title,
      body: data.body,
      upvotes: 0,
      userVote: null,
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    setNewPostTitle('');
    setNewPostBody('');
    setNewPostTopic('Grammar Help');
    setShowNewPostForm(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (postId.startsWith('seed-')) return;
    await supabase.from('community_posts').delete().eq('id', postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleSubmitComment = async (postId: string) => {
    const commentText = commentInputs[postId]?.trim();
    if (!commentText || !user) return;

    if (postId.startsWith('seed-')) {
      const newComment: Comment = {
        id: `local-${Date.now()}`,
        author: `u/${user.user_metadata?.username || user.email?.split('@')[0] || 'You'}`,
        user_id: user.id,
        timeAgo: 'Just now',
        text: commentText,
        upvotes: 0,
        userVote: null,
      };
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          return { ...post, comments: [...post.comments, newComment] };
        })
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      return;
    }

    const authorName = user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous';
    const { data, error } = await supabase
      .from('community_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        author_name: `u/${authorName}`,
        body: commentText,
      })
      .select('id, user_id, author_name, body, upvotes, created_at')
      .single();

    if (error || !data) return;

    const newComment: Comment = {
      id: data.id,
      author: data.author_name,
      user_id: data.user_id,
      timeAgo: 'Just now',
      text: data.body,
      upvotes: 0,
      userVote: null,
    };
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return { ...post, comments: [...post.comments, newComment] };
      })
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!commentId.startsWith('seed-') && !commentId.startsWith('local-')) {
      await supabase.from('community_comments').delete().eq('id', commentId);
    }
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return { ...post, comments: post.comments.filter((c) => c.id !== commentId) };
      })
    );
  };

  return (
    <PageLayout backgroundColor="#FFDFFC">
      <div className="absolute top-0 left-0 right-0 h-[120px] bg-[#FFB2F7] origin-top-left -skew-y-3 pointer-events-none" />

      <div className="max-w-[684px] mx-auto px-4 sm:px-6 pt-8 pb-20 relative z-10">
        <div className="flex flex-col items-center gap-2 mb-10 text-center">
          <h1 className="font-inter font-bold text-[25.5px] leading-[36px] text-[#372213]">
            {t('community.title')}
          </h1>
          <p className="font-inter text-[13.6px] leading-[24px] text-[#372213]">
            {t('page.communitySubtitle')}
          </p>
        </div>
        {showInstructions && (
          <div className="bg-white/80 rounded-[12px] px-4 py-3 shadow-sm border border-[#E879F9]/30 mb-6">
            <p className="font-inter text-[13px] leading-[20px] text-[#372213]">
              {t('instructions.community')}
            </p>
          </div>
        )}

        <div className="relative mb-8">
          <div className="w-full bg-white rounded-xl border border-[#E5E7EB] flex items-center px-4 py-3 gap-3 shadow-sm">
            <Search className="w-5 h-5 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => { if (searchQuery.length > 0) setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder={t('community.search')}
              className="flex-1 bg-transparent border-none outline-none font-inter text-[16px] text-[#372213] placeholder:text-[#9CA3AF]"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowSuggestions(false); }} className="text-[#9CA3AF] hover:text-[#372213]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#E5E7EB] shadow-lg z-20 max-h-[240px] overflow-y-auto">
              {SUGGESTED_QUESTIONS.filter(q => q.toLowerCase().includes(searchQuery.toLowerCase())).map((q) => (
                <button
                  key={q}
                  onMouseDown={() => { setSearchQuery(q); setShowSuggestions(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#FFDFFC]/40 font-inter text-[14px] text-[#372213] border-b border-[#F3F4F6] last:border-b-0 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-[#9CA3AF] inline mr-2" />
                  {q}
                </button>
              ))}
              {SUGGESTED_QUESTIONS.filter(q => q.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <p className="px-4 py-3 text-[13px] text-[#9CA3AF] font-inter">No suggestions found</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {['All Topics', 'Grammar Help', 'Pronunciation', 'Culture Exchange', 'Study Tips'].map(
            (section) => (
              <button
                key={section}
                onClick={() => setSelectedTopic(section)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-inter font-medium text-[14px] transition-colors ${
                  selectedTopic === section
                    ? 'bg-[#372213] text-white'
                    : 'bg-white text-[#372213] hover:bg-gray-50 border border-[#E5E7EB]'
                }`}
              >
                {section}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => setShowNewPostForm(true)}
          className="w-full bg-[#FF4D01] hover:bg-[#E64401] text-white rounded-xl px-6 py-4 font-inter font-semibold text-[16px] flex items-center justify-center gap-2 shadow-sm transition-colors mb-6"
        >
          <Plus className="w-5 h-5" />
          {t('community.askQuestion')}
        </button>

        <AnimatePresence>
          {showNewPostForm && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6 mb-6 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-inter font-bold text-[18px] text-[#372213]">Ask a Question</h3>
                <button
                  onClick={() => setShowNewPostForm(false)}
                  className="text-[#9CA3AF] hover:text-[#372213] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block font-inter font-medium text-[14px] text-[#372213] mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="What's your question?"
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg font-inter text-[16px] text-[#372213] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block font-inter font-medium text-[14px] text-[#372213] mb-2">
                    Details
                  </label>
                  <textarea
                    value={newPostBody}
                    onChange={(e) => setNewPostBody(e.target.value)}
                    placeholder="Provide more context or details..."
                    rows={4}
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg font-inter text-[16px] text-[#372213] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block font-inter font-medium text-[14px] text-[#372213] mb-2">
                    Topic
                  </label>
                  <select
                    value={newPostTopic}
                    onChange={(e) => setNewPostTopic(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg font-inter text-[16px] text-[#372213] focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:border-transparent bg-white"
                  >
                    {TOPICS.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>
                {postError && (
                  <p className="text-[#EF4444] font-inter text-[13px]">{postError}</p>
                )}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => { setShowNewPostForm(false); setPostError(null); }}
                    className="px-6 py-2.5 border border-[#E5E7EB] rounded-lg font-inter font-medium text-[14px] text-[#372213] hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitPost}
                    disabled={!newPostTitle.trim() || !newPostBody.trim()}
                    className="px-6 py-2.5 bg-[#FF4D01] hover:bg-[#E64401] disabled:bg-[#9CA3AF] disabled:cursor-not-allowed text-white rounded-lg font-inter font-medium text-[14px] transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <p className="text-center text-[#372213] py-8">Loading posts...</p>
        ) : (
        <div className="flex flex-col gap-4">
          {posts.filter(post => {
            if (selectedTopic !== 'All Topics' && post.topic !== selectedTopic) return false;
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase();
              return post.title.toLowerCase().includes(q) || post.body.toLowerCase().includes(q);
            }
            return true;
          }).map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden"
            >
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePostVote(post.id, 'up'); }}
                      className={`p-1 hover:bg-gray-200 rounded transition-colors ${post.userVote === 'up' ? 'text-[#FF4D01]' : 'text-[#9CA3AF]'}`}
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                    <span className="font-inter font-bold text-[14px] text-[#372213]">{post.upvotes}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePostVote(post.id, 'down'); }}
                      className={`p-1 hover:bg-gray-200 rounded transition-colors ${post.userVote === 'down' ? 'text-[#FF4D01]' : 'text-[#9CA3AF]'}`}
                    >
                      <ArrowDown className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#FFDFFC] rounded-full flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-[#FF4D01]" />
                      </div>
                      <span className="font-inter font-medium text-[13px] text-[#372213]">{post.author}</span>
                      <span className="font-inter text-[13px] text-[#372213]">• {post.timeAgo}</span>
                      <span className="px-2 py-0.5 bg-[#F3F4F6] rounded text-[11px] font-medium text-[#372213] ml-auto">
                        {post.topic}
                      </span>
                    </div>
                    <h2 className="font-inter font-bold text-[18px] leading-[26px] text-[#372213]">{post.title}</h2>
                    {post.body && (
                      <p className="font-inter text-[14px] leading-[22px] text-[#372213] mt-1">{post.body}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-[#372213]">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-inter font-medium text-[13px]">
                          {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
                        </span>
                      </div>
                      {user && post.user_id === user.id && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                          className="flex items-center gap-1 text-[#EF4444] hover:text-[#DC2626] transition-colors ml-auto"
                          title="Delete your post"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="font-inter font-medium text-[12px]">Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {expandedPost === post.id && (
                <div className="border-t border-[#E5E7EB] bg-gray-50/50 p-5">
                  {post.comments.length > 0 && (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <span className="font-inter font-semibold text-[15px] text-[#372213]">Top Responses</span>
                      </div>
                      <div className="flex flex-col gap-6 mb-6">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="flex flex-col items-center gap-1 mt-1">
                              <button
                                onClick={() => handleCommentVote(post.id, comment.id, 'up')}
                                className={`transition-colors ${comment.userVote === 'up' ? 'text-[#FF4D01]' : 'text-[#9CA3AF]'}`}
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <span className="font-inter font-bold text-[12px] text-[#372213]">{comment.upvotes}</span>
                              <button
                                onClick={() => handleCommentVote(post.id, comment.id, 'down')}
                                className={`transition-colors ${comment.userVote === 'down' ? 'text-[#FF4D01]' : 'text-[#9CA3AF]'}`}
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-inter font-medium text-[13px] text-[#372213]">{comment.author}</span>
                                <span className="font-inter text-[12px] text-[#372213]">• {comment.timeAgo}</span>
                                {user && comment.user_id === user.id && (
                                  <button
                                    onClick={() => handleDeleteComment(post.id, comment.id)}
                                    className="ml-auto text-[#EF4444] hover:text-[#DC2626] transition-colors"
                                    title="Delete your comment"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              <p className="font-inter text-[14px] leading-[22px] text-[#372213]">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-[#FFDFFC] rounded-full flex items-center justify-center flex-shrink-0 mt-2">
                      <User className="w-3.5 h-3.5 text-[#FF4D01]" />
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <textarea
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Add a comment..."
                        rows={3}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg font-inter text-[14px] text-[#372213] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF4D01] focus:border-transparent resize-none"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleSubmitComment(post.id)}
                          disabled={!commentInputs[post.id]?.trim()}
                          className="px-5 py-2 bg-[#FF4D01] hover:bg-[#E64401] disabled:bg-[#9CA3AF] disabled:cursor-not-allowed text-white rounded-lg font-inter font-medium text-[14px] transition-colors"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        )}
      </div>
    </PageLayout>
  );
}
