"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { SupabaseClient, User } from "@supabase/supabase-js";
import Image from "next/image";
import toast from "react-hot-toast";
import Link from "next/link";

// ---------- Types ----------
export type CommentStatus = "approved" | "spam" | "hidden";

interface Comment {
  id: number;
  blog_post_id: number;
  user_id: string;
  parent_comment_id: number | null;
  content: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  profile?: Profile | null;
  total_likes: number;
  current_user_liked: boolean;
  replies?: Comment[];
}
interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

interface Comment {
  id: number;
  blog_post_id: number;
  user_id: string;
  parent_comment_id: number | null;
  content: string;
  // status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // profile?: Profile;
  username: string;
  total_likes: number;
  current_user_liked: boolean;
  replies?: Comment[];
}

interface CommentsProps {
  postId: number | string;
  supabase: SupabaseClient;
}

// ---------- Helper to build comment tree ----------
function buildCommentTree(comments: Comment[]): Comment[] {
  const map: Record<number, Comment> = {};
  const roots: Comment[] = [];

  comments.forEach((c) => {
    map[c.id] = { ...c, replies: [] };
  });

  comments.forEach((c) => {
    if (c.parent_comment_id && map[c.parent_comment_id]) {
      map[c.parent_comment_id].replies!.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });

  const sortFn = (a: Comment, b: Comment) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  roots.sort(sortFn);
  Object.values(map).forEach((node) => node.replies?.sort(sortFn));

  return roots;
}

// ---------- Main Component ----------
export default function BlogComments({ postId, supabase }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // ---------- Get current user ----------
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking user:", error);
        setUser(null);
      }
    };
    checkUser();
  }, [supabase]);

  // ---------- Load comments (fixed) ----------
  const loadComments = useCallback(
    async (reset: boolean = false) => {
      if (!postId) return;
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch comments with profile
        let query = supabase
          .from("comments")
          .select(
            `
              *,
              profile:profiles!user_id (
                id,
                username,
                full_name,
                avatar_url
              )
            `,
          )
          .eq("blog_post_id", postId)
          .eq("status", "approved")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(20);

        if (cursor && !reset) {
          query = query.lt("id", cursor);
        }

        const { data: commentsData, error: err } = await query;
        if (err) throw err;

        if (!commentsData || commentsData.length === 0) {
          if (reset) setComments([]);
          setHasMore(false);
          setCursor(null);
          setLoading(false);
          return;
        }

        // 2. Fetch likes for these comment IDs
        const commentIds = commentsData.map((c) => c.id);
        const { data: likesData, error: likesErr } = await supabase
          .from("comment_engagements")
          .select("comment_id, user_id")
          .in("comment_id", commentIds);

        if (likesErr) throw likesErr;

        // 3. Compute totals and current user like
        const likesMap: Record<
          number,
          { total: number; currentUserLiked: boolean }
        > = {};
        commentIds.forEach((id) => {
          likesMap[id] = { total: 0, currentUserLiked: false };
        });

        (likesData || []).forEach((like) => {
          const id = like.comment_id;
          if (likesMap[id]) {
            likesMap[id].total += 1;
            if (user && like.user_id === user.id) {
              likesMap[id].currentUserLiked = true;
            }
          }
        });

        // 4. Merge
        const formatted: Comment[] = commentsData.map((item: Comment) => ({
          ...item,
          total_likes: likesMap[item.id]?.total || 0,
          current_user_liked: likesMap[item.id]?.currentUserLiked || false,
        }));

        if (reset) {
          setComments(formatted);
        } else {
          setComments((prev) => [...prev, ...formatted]);
        }

        setHasMore(formatted.length === 20);
        if (formatted.length > 0) {
          setCursor(formatted[formatted.length - 1].id);
        } else {
          setCursor(null);
        }
      } catch (error) {
        // setError(err.message || "Failed to load comments");
        toast.error("Failed to load comments");
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [postId, cursor, supabase, user], // user added for the like check
  );

  // Initial load
  useEffect(() => {
    setCursor(null);
    setHasMore(true);
    setComments([]);
    loadComments(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadComments(false);
        }
      },
      { threshold: 0.5 },
    );
    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, loading, loadComments]);

  // ---------- Submit comment ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to comment");
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      // 1. Ensure profile exists
      const { data: existingProfile, error: profileFetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileFetchError && profileFetchError.code !== "PGRST116") {
        throw profileFetchError;
      }

      if (!existingProfile) {
        const { error: insertProfileError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            username:
              user.user_metadata?.username ||
              user.email?.split("@")[0] ||
              "user",
            full_name:
              user.user_metadata?.full_name || user.user_metadata?.name || "",
            avatar_url: user.user_metadata?.avatar_url || "",
          });
        if (insertProfileError) throw insertProfileError;
      }

      // 2. Insert the comment
      const { data, error: err } = await supabase
        .from("comments")
        .insert({
          blog_post_id: postId,
          user_id: user.id,
          content: newComment.trim(),
          parent_comment_id: replyingTo,
          status: "approved",
        })
        .select()
        .single();

      if (err) throw err;

      // 3. Optimistic update
      const optimistic: Comment = {
        ...data,
        profile: {
          id: user.id,
          username: user.user_metadata?.username,
          full_name: user.user_metadata?.full_name,
          avatar_url: user.user_metadata?.avatar_url,
        },
        total_likes: 0,
        current_user_liked: false,
        replies: [],
      };

      if (replyingTo) {
        setComments((prev) => {
          const newComments = [...prev];
          const parent = findCommentById(newComments, replyingTo);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(optimistic);
          }
          return newComments;
        });
      } else {
        setComments((prev) => [optimistic, ...prev]);
      }

      setNewComment("");
      setReplyingTo(null);
      toast.success("Comment posted (pending approval)");
    } catch (error) {
      // toast.error(error.message || "Failed to post comment");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  function findCommentById(comments: Comment[], id: number): Comment | null {
    for (const c of comments) {
      if (c.id === id) return c;
      if (c.replies) {
        const found = findCommentById(c.replies, id);
        if (found) return found;
      }
    }
    return null;
  }

  // ---------- Like/Unlike ----------
  const toggleLike = async (commentId: number) => {
    if (!user) {
      toast.error("Please log in to like");
      return;
    }

    setComments((prev) => {
      const newComments = [...prev];
      const comment = findCommentById(newComments, commentId);
      if (!comment) return prev;
      if (comment.current_user_liked) {
        comment.total_likes -= 1;
        comment.current_user_liked = false;
      } else {
        comment.total_likes += 1;
        comment.current_user_liked = true;
      }
      return newComments;
    });

    try {
      const { data: existing } = await supabase
        .from("comment_engagements")
        .select("comment_id")
        .eq("comment_id", commentId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("comment_engagements")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("comment_engagements")
          .insert({ comment_id: commentId, user_id: user.id });
        if (error) throw error;
      }
    } catch (error) {
      // Rollback
      setComments((prev) => {
        const newComments = [...prev];
        const comment = findCommentById(newComments, commentId);
        if (!comment) return prev;
        if (comment.current_user_liked) {
          comment.total_likes -= 1;
          comment.current_user_liked = false;
        } else {
          comment.total_likes += 1;
          comment.current_user_liked = true;
        }
        return newComments;
      });
      toast.error("Failed to update like");
      console.error(error);
    }
  };

  // ---------- Render comment ----------
  const renderComment = (comment: Comment, depth: number = 0) => {
    console.log("This is a comment", comment);
    const isReply = depth > 0;
    return (
      <div
        key={comment.id}
        className={`${isReply ? "ml-8 mt-3" : "mt-4"} border-l-2 pl-4 ${
          isReply ? "border-gray-300" : "border-gray-200"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-200">
            {comment.profile?.avatar_url ? (
              <Image
                src={comment.profile.avatar_url}
                alt="avatar"
                width={32}
                height={32}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                {comment.profile?.username?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">
                {comment?.username || "Unknown"}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
              {comment.status === "approved" && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  approved
                </span>
              )}
            </div>
            <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
              {comment.content}
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs">
              <button
                onClick={() => toggleLike(comment.id)}
                className={`flex items-center gap-1 transition ${
                  comment.current_user_liked
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-blue-600"
                }`}
              >
                <span>{comment.current_user_liked ? "❤️" : "🤍"}</span>
                <span>{comment.total_likes}</span>
              </button>
              {user && !comment.deleted_at && (
                <button
                  onClick={() => {
                    setReplyingTo(
                      replyingTo === comment.id ? null : comment.id,
                    );
                    setNewComment("");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Reply
                </button>
              )}
            </div>
            {replyingTo === comment.id && (
              <form onSubmit={handleSubmit} className="mt-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={2}
                />
                <div className="flex gap-2 mt-1">
                  <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                  >
                    {submitting ? "Posting..." : "Post Reply"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-500 text-sm hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2">
                {comment.replies.map((reply) =>
                  renderComment(reply, depth + 1),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const tree = buildCommentTree(comments);

  return (
    <div className="w-full max-w-3xl mx-auto py-6">
      <h3 className="text-xl font-bold mb-4">Comments ({comments.length})</h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-600 mb-6">
          Please{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            log in
          </a>{" "}
          to join the discussion.
        </div> */}
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-600 mb-6">
            Please{" "}
            <Link className="text-blue-600 hover:underline" href="/signup">
              log in{" "}
            </Link>
            to join the discussion.
          </div>
        </>
      )}

      {loading && comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Loading comments...
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : tree.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No comments yet. Be the first!
        </div>
      ) : (
        <div>
          {tree.map((comment) => renderComment(comment, 0))}
          {hasMore && (
            <div
              ref={loadMoreRef}
              className="py-4 text-center text-gray-400 text-sm"
            >
              {loading ? "Loading more..." : "Load more"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
