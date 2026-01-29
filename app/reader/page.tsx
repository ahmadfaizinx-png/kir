"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useParams } from "next/navigation";

interface Work {
  id: string;
  title: string;
  content: string;
  likes_count: number;
}

export default function ReaderDetailPage() {
  const { id } = useParams();
  const supabase = createClient();

  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWork();
  }, []);

  async function loadWork() {
    const { data, error } = await supabase
      .from("works")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) setWork(data);
    setLoading(false);
  }

  async function handleLike() {
    if (!work) return;

    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("work_id", work.id)
      .single();

    if (existingLike) {
      // UNLIKE
      await supabase.from("likes").delete().eq("work_id", work.id);

      await supabase
        .from("works")
        .update({ likes_count: work.likes_count - 1 })
        .eq("id", work.id);
    } else {
      // LIKE ✅ FIX DI SINI
      await supabase.from("likes").insert({
        work_id: work.id,
      });

      await supabase
        .from("works")
        .update({ likes_count: work.likes_count + 1 })
        .eq("id", work.id);
    }

    loadWork();
  }

  if (loading) return <p>Loading...</p>;
  if (!work) return <p>Data tidak ditemukan</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{work.title}</h1>
      <p className="mb-6">{work.content}</p>

      <Button variant="ghost" onClick={handleLike}>
        <Heart className="mr-2 h-4 w-4" />
        {work.likes_count}
      </Button>
    </div>
  );
}
