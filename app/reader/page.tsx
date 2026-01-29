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
  const [selectedCategory, setSelectedCategory] =
    useState<WorkCategory>("all");
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

      if (error) throw error;
      setWorks(data || []);
    } catch (err) {
      console.error(err);
      setWorks([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(workId: string) {
    try {
      const work = works.find(w => w.id === workId);
      if (!work) return;

      const { data: existingLike } = await supabase
        .from("likes")
        .select("id")
        .eq("work_id", workId)
        .single();

      if (existingLike) {
        // UNLIKE
        await supabase
          .from("likes")
          .delete()
          .eq("work_id", workId);

        await supabase
          .from("works")
          .update({ likes_count: work.likes_count - 1 })
          .eq("id", workId);
      } else {
        // LIKE (INI YANG DIPERBAIKI)
        await supabase
          .from("likes")
          .insert({ work_id: workId });

        await supabase
          .from("works")
          .update({ likes_count: work.likes_count + 1 })
          .eq("id", workId);
      }

      loadWorks();
    } catch (err) {
      console.error("Like error:", err);
    }
  }

  function handleDownload(fileUrl?: string) {
    if (fileUrl) window.open(fileUrl, "_blank");
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
      alert("Link berhasil disalin");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <Link href="/" className="text-2xl font-bold text-green-700">
            Web Karya KIR
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Beranda
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">Memuat...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredWorks.map(work => (
              <Link key={work.id} href={`/reader/${work.id}`}>
                <Card className="hover:shadow-lg cursor-pointer">
                  {work.image_url && (
                    <div className="relative h-48">
                      <Image
                        src={work.image_url}
                        alt={work.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{work.title}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Oleh: {work.author_name}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={e => {
                        e.preventDefault();
                        handleLike(work.id);
                      }}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {work.likes_count}
                    </Button>
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
