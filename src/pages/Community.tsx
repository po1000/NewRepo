import React, { useState } from 'react';
import {
  Search,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  User,
  X,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout } from '../components/PageLayout';
import { usePageTitle } from '../hooks/usePageTitle';

interface Reply {
  id: string;
  author: string;
  timeAgo: string;
  text: string;
  upvotes: number;
  userVote: 'up' | 'down' | null;
}
interface Comment {
  id: string;
  author: string;
  timeAgo: string;
  text: string;
  upvotes: number;
  userVote: 'up' | 'down' | null;
  replies: Reply[];
}
interface Post {
  id: string;
  author: string;
  timeAgo: string;
  topic: string;
  title: string;
  body: string;
  upvotes: number;
  userVote: 'up' | 'down' | null;
  comments: Comment[];
}

const TOPICS = ['Grammar Help', 'Pronunciation', 'Culture Exchange', 'Study Tips'];

export function Community() {
  usePageTitle('Community');
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'post-1',
      author: 'u/SpanishLearner99',
      timeAgo: '4 hours ago',
      topic: 'Pronunciation',
      title: 'How do you pronounce the double R (rr) correctly?',
      body: "I've been practicing for weeks but I still can't seem to roll my R's properly. Words like \"perro\" and \"carro\" sound terrible when I say them. Any tips or exercises that worked for you?",
      upvotes: 124,
      userVote: null,
      comments: [
        {
          id: 'comment-1',
          author: 'u/NativeSpeaker_Madrid',
          timeAgo: '3 hours ago',
          text: "Try saying \"butter\" or \"ladder\" in an American accent really fast. The position your tongue hits the roof of your mouth for the 'tt' or 'dd' is exactly where it needs to be for the Spanish R. Start there, then try to push more air to make it vibrate.",
          upvotes: 89,
          userVote: null,
          replies: [
            {
              id: 'reply-1',
              author: 'u/SpanishLearner99',
              timeAgo: '2 hours ago',
              text: "Wow, the \"butter\" trick actually helps! I can feel the placement now. Still can't trill it consistently but it's a start. Gracias!",
              upvotes: 15,
              userVote: null,
            },
          ],
        },
      ],
    },
    {
      id: 'post-2',
      author: 'u/GrammarNerd',
      timeAgo: '1 day ago',
      topic: 'Grammar Help',
      title: 'Por vs Para - The ultimate cheat sheet',
      body: '',
      upvotes: 56,
      userVote: null,
      comments: [],
    },
  ]);
  const [expandedPost, setExpandedPost] = useState<string | null>('post-1');
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({ 'reply-1': true });
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [newPostTopic, setNewPostTopic] = useState('Grammar Help');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [selectedTopic, setSelectedTopic] = useState<string>('All Topics');

  const toggleReply = (id: string) => {
    setExpandedReplies((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

  const handleSubmitPost = () => {
    if (!newPostTitle.trim() || !newPostBody.trim()) return;
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: 'u/You',
      timeAgo: 'Just now',
      topic: newPostTopic,
      title: newPostTitle,
      body: newPostBody,
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

  const handleSubmitComment = (postId: string) => {
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: 'u/You',
      timeAgo: 'Just now',
      text: commentText,
      upvotes: 0,
      userVote: null,
      replies: [],
    };
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return { ...post, comments: [...post.comments, newComment] };
      })
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  return (
    <PageLayout backgroundColor="#FFDFFC">
      {/* Decorative Swoosh Background */}
      <div className="absolute top-0 left-0 right-0 h-[120px] bg-[#FFB2F7] origin-top-left -skew-y-3 pointer-events-none" />

      <div className="max-w-[684px] mx-auto px-4 sm:px-6 pt-8 pb-20 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-10 text-center">
          <h1 className="font-inter font-bold text-[25.5px] leading-[36px] text-[#372213]">
            The Community
          </h1>
          <p className="font-inter text-[13.6px] leading-[24px] text-[#4B5563]">
            Ask questions, share tips, and learn together with fellow Spanish learners
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full bg-white rounded-xl border border-[#E5E7EB] flex items-center px-4 py-3 gap-3 shadow-sm mb-8">
          <Search className="w-5 h-5 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search topics, questions, or grammar rules..."
            className="flex-1 bg-transparent border-none outline-none font-inter text-[16px] text-[#372213] placeholder:text-[#9CA3AF]"
          />
        </div>

        {/* Forum Sections — functional filter */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {['All Topics', 'Grammar Help', 'Pronunciation', 'Culture Exchange', 'Study Tips'].map(
            (section) => (
              <button
                key={section}
                onClick={() => setSelectedTopic(section)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-inter font-medium text-[14px] transition-colors ${
                  selectedTopic === section
                    ? 'bg-[#372213] text-white'
                    : 'bg-white text-[#4B5563] hover:bg-gray-50 border border-[#E5E7EB]'
                }`}
              >
                {section}
              </button>
            )
          )}
        </div>

        {/* New Post Button */}
        <button
          onClick={() => setShowNewPostForm(true)}
          className="w-full bg-[#FF4D01] hover:bg-[#E64401] text-white rounded-xl px-6 py-4 font-inter font-semibold text-[16px] flex items-center justify-center gap-2 shadow-sm transition-colors mb-6"
        >
          <Plus className="w-5 h-5" />
          Ask a Question
        </button>

        {/* New Post Form */}
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
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowNewPostForm(false)}
                    className="px-6 py-2.5 border border-[#E5E7EB] rounded-lg font-inter font-medium text-[14px] text-[#4B5563] hover:bg-gray-50 transition-colors"
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

        {/* Forum Posts */}
        <div className="flex flex-col gap-4">
          {posts.filter(post => selectedTopic === 'All Topics' || post.topic === selectedTopic).map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden"
            >
              {/* Post Header */}
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Upvotes */}
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

                  {/* Content */}
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#FFDFFC] rounded-full flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-[#FF4D01]" />
                      </div>
                      <span className="font-inter font-medium text-[13px] text-[#4B5563]">{post.author}</span>
                      <span className="font-inter text-[13px] text-[#9CA3AF]">• {post.timeAgo}</span>
                      <span className="px-2 py-0.5 bg-[#F3F4F6] rounded text-[11px] font-medium text-[#4B5563] ml-auto">
                        {post.topic}
                      </span>
                    </div>
                    <h2 className="font-inter font-bold text-[18px] leading-[26px] text-[#372213]">{post.title}</h2>
                    {post.body && (
                      <p className="font-inter text-[14px] leading-[22px] text-[#4B5563] mt-1">{post.body}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-[#6B7280]">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-inter font-medium text-[13px]">
                          {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Responses */}
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
                                <span className="font-inter text-[12px] text-[#9CA3AF]">• {comment.timeAgo}</span>
                              </div>
                              <p className="font-inter text-[14px] leading-[22px] text-[#4B5563]">{comment.text}</p>
                              {comment.replies.length > 0 && (
                                <>
                                  <button
                                    onClick={() => toggleReply(comment.id)}
                                    className="flex items-center gap-1 text-[#FF4D01] font-inter font-medium text-[13px] mt-1 w-fit"
                                  >
                                    {expandedReplies[comment.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    {expandedReplies[comment.id]
                                      ? 'Hide replies'
                                      : `${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
                                  </button>
                                  {expandedReplies[comment.id] && (
                                    <div className="flex flex-col gap-4 mt-3 pl-4 border-l-2 border-gray-200">
                                      {comment.replies.map((reply) => (
                                        <div key={reply.id} className="flex gap-3">
                                          <div className="flex flex-col items-center gap-1 mt-1">
                                            <button className="text-[#9CA3AF]">
                                              <ArrowUp className="w-4 h-4" />
                                            </button>
                                            <span className="font-inter font-bold text-[12px] text-[#372213]">{reply.upvotes}</span>
                                          </div>
                                          <div className="flex-1 flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                              <span className="font-inter font-medium text-[13px] text-[#372213]">{reply.author}</span>
                                              <span className="font-inter text-[12px] text-[#9CA3AF]">• {reply.timeAgo}</span>
                                            </div>
                                            <p className="font-inter text-[14px] leading-[22px] text-[#4B5563]">{reply.text}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Comment Input */}
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
      </div>
    </PageLayout>
  );
}
