"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Download, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Footer from "@/components/Footer";

type WorkCategory = 
  | "eksperimen" 
  | "fakta" 
  | "kata-kata-motivasi" 
  | "berita-terkini" 
  | "karya-kir-lainnya"
  | "info-kir"
  | "all";

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

export default function ReaderPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [filteredWorks, setFilteredWorks] = useState<Work[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<WorkCategory>("all");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const categories = [
    { id: "all", label: "Semua" },
    { id: "eksperimen", label: "Eksperimen" },
    { id: "fakta", label: "Fakta" },
    { id: "kata-kata-motivasi", label: "Kata-kata Motivasi" },
    { id: "berita-terkini", label: "Berita Terkini" },
    { id: "karya-kir-lainnya", label: "Karya KIR Lainnya" },
    { id: "info-kir", label: "Info KIR" },
  ];

  useEffect(() => {
    loadWorks();
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredWorks(works);
    } else {
      setFilteredWorks(works.filter(w => w.category === selectedCategory));
    }
  }, [selectedCategory, works]);

  async function loadWorks() {
    try {
      const { data, error } = await supabase
        .from("works")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        // Show user-friendly error message
        if (error.message.includes("Invalid API key") || error.message.includes("JWT")) {
          console.error("Supabase configuration error. Please check your .env.local file.");
        }
        throw error;
      }
      setWorks(data || []);
    } catch (error: any) {
      console.error("Error loading works:", error);
      // Set empty array on error to show appropriate message
      setWorks([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(workId: string) {
    try {
      const work = works.find(w => w.id === workId);
      if (!work) return;

      // Get user IP for tracking
      const userIp = localStorage.getItem("user_ip") || `user_${Date.now()}`;
      localStorage.setItem("user_ip", userIp);

      // Check if already liked
      const { data: existingLike } = await supabase
        .from("likes")
        .select("*")
        .eq("work_id", workId)
        .eq("user_ip", userIp)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from("likes")
          .delete()
          .eq("work_id", workId)
          .eq("user_ip", userIp);
        
        await supabase
          .from("works")
          .update({ likes_count: work.likes_count - 1 })
          .eq("id", workId);
      } else {
        // Like
        await supabase
          .from("likes")
          .insert({ work_id: workId, user_ip });
        
        await supabase
          .from("works")
          .update({ likes_count: work.likes_count + 1 })
          .eq("id", workId);
      }

      loadWorks();
    } catch (error) {
      console.error("Error handling like:", error);
    }
  }

  async function handleDownload(workId: string, fileUrl?: string) {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  }

  function handleShare(work: Work) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold text-green-700">Web Karya KIR</h1>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Beranda
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-4">Karya KIR</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id as WorkCategory)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Memuat karya...</div>
        ) : filteredWorks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              {works.length === 0 
                ? "Belum ada karya yang diposting atau terjadi kesalahan saat memuat data."
                : "Belum ada karya untuk kategori ini."}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredWorks.map((work) => (
              <Link key={work.id} href={`/reader/${work.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  {work.image_url && (
                    <div className="relative w-full h-48">
                      <Image
                        src={work.image_url}
                        alt={work.title}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="secondary">{work.category}</Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(work.created_at), "dd MMM yyyy", {
                          locale: id,
                        })}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{work.title}</CardTitle>
                    <p className="text-sm text-gray-600">Oleh: {work.author_name}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                      {work.content}
                    </p>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          handleLike(work.id);
                        }}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {work.likes_count || 0}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {work.comments_count || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          handleShare(work);
                        }}
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Bagikan
                      </Button>
                      {work.file_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDownload(work.id, work.file_url);
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Unduh
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
