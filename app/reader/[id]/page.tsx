"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Footer from "@/components/Footer";

interface Work {
  id: string;
  title: string;
  content: string;
  category: string;
  author_name: string;
  image_url?: string;
  video_url?: string;
  file_url?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export default function WorkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [work, setWork] = useState<Work | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (params.id) {
      loadWork();
      loadComments();
    }
  }, [params.id]);

  async function loadWork() {
    try {
      const { data, error } = await supabase
        .from("works")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        // Show user-friendly error message
        if (error.message.includes("Invalid API key") || error.message.includes("JWT")) {
          console.error("Supabase configuration error. Please check your .env.local file.");
        }
        throw error;
      }
      setWork(data);
    } catch (error: any) {
      console.error("Error loading work:", error);
      setWork(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadComments() {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("work_id", params.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  }

  async function handleLike() {
    if (!work) return;
    
    try {
      // Get user IP for tracking (simplified - in production use proper user identification)
      const userIp = localStorage.getItem("user_ip") || `user_${Date.now()}`;
      localStorage.setItem("user_ip", userIp);

      // Check if already liked
      const { data: existingLike } = await supabase
        .from("likes")
        .select("*")
        .eq("work_id", work.id)
        .eq("user_ip", userIp)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from("likes")
          .delete()
          .eq("work_id", work.id)
          .eq("user_ip", userIp);
        
        await supabase
          .from("works")
          .update({ likes_count: work.likes_count - 1 })
          .eq("id", work.id);
      } else {
        // Like
        await supabase
          .from("likes")
          .insert({ work_id: work.id, user_ip });
        
        await supabase
          .from("works")
          .update({ likes_count: work.likes_count + 1 })
          .eq("id", work.id);
      }

      loadWork();
    } catch (error) {
      console.error("Error handling like:", error);
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!work || !commentName.trim() || !commentContent.trim()) return;

    setSubmittingComment(true);
    try {
      const { error } = await supabase
        .from("comments")
        .insert({
          work_id: work.id,
          author_name: commentName.trim(),
          content: commentContent.trim(),
        });

      if (error) throw error;

      // Update comments count
      await supabase
        .from("works")
        .update({ comments_count: work.comments_count + 1 })
        .eq("id", work.id);

      setCommentName("");
      setCommentContent("");
      loadComments();
      loadWork();
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Terjadi kesalahan saat mengirim komentar");
    } finally {
      setSubmittingComment(false);
    }
  }

  function handleShare() {
    if (!work) return;
    if (navigator.share) {
      navigator.share({
        title: work.title,
        text: work.content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link berhasil disalin!");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Memuat...</div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">Karya tidak ditemukan</p>
            <Link href="/reader">
              <Button>Kembali ke Daftar Karya</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/reader">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-green-700">Web Karya KIR</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          {work.image_url && (
            <div className="relative w-full h-96">
              <Image
                src={work.image_url}
                alt={work.title}
                fill
                className="object-cover rounded-t-lg"
                unoptimized
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-start justify-between gap-2 mb-2">
              <Badge variant="secondary">{work.category}</Badge>
              <span className="text-xs text-gray-500">
                {format(new Date(work.created_at), "dd MMMM yyyy, HH:mm", {
                  locale: id,
                })}
              </span>
            </div>
            <CardTitle className="text-3xl">{work.title}</CardTitle>
            <p className="text-gray-600">Oleh: {work.author_name}</p>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none mb-6">
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {work.content}
              </p>
            </div>

            {work.video_url && (
              <div className="mb-6">
                <video
                  src={work.video_url}
                  controls
                  className="w-full rounded-lg"
                >
                  Browser Anda tidak mendukung video.
                </video>
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" onClick={handleLike}>
                <Heart className="h-4 w-4 mr-2" />
                {work.likes_count || 0}
              </Button>
              <Button variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                {work.comments_count || 0} Komentar
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Bagikan
              </Button>
              {work.file_url && (
                <Button
                  variant="outline"
                  onClick={() => window.open(work.file_url, "_blank")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Unduh
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Komentar ({comments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitComment} className="mb-6 space-y-4">
              <div>
                <Input
                  placeholder="Nama Anda"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Textarea
                  placeholder="Tulis komentar Anda..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" disabled={submittingComment}>
                {submittingComment ? "Mengirim..." : "Kirim Komentar"}
              </Button>
            </form>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Belum ada komentar. Jadilah yang pertama!
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-b border-gray-200 pb-4 last:border-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold">{comment.author_name}</p>
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.created_at), "dd MMM yyyy, HH:mm", {
                          locale: id,
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
