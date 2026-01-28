"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X, Upload as UploadIcon } from "lucide-react";
import Image from "next/image";

interface UploadWorkModalProps {
  onClose: () => void;
  memberName: string;
}

const categories = [
  { value: "eksperimen", label: "Eksperimen" },
  { value: "fakta", label: "Fakta" },
  { value: "kata-kata-motivasi", label: "Kata-kata Motivasi" },
  { value: "berita-terkini", label: "Berita Terkini" },
  { value: "karya-kir-lainnya", label: "Karya KIR Lainnya" },
];

export default function UploadWorkModal({ onClose, memberName }: UploadWorkModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("eksperimen");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileFile, setFileFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Judul dan konten tidak boleh kosong");
      return;
    }

    setUploading(true);

    try {
      let imageUrl = null;
      let videoUrl = null;
      let fileUrl = null;

      // Upload image if exists
      if (imageFile) {
        const imageExt = imageFile.name.split(".").pop();
        const imageName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${imageExt}`;
        const { data: imageData, error: imageError } = await supabase.storage
          .from("works")
          .upload(imageName, imageFile);

        if (imageError) throw imageError;
        const { data: { publicUrl } } = supabase.storage
          .from("works")
          .getPublicUrl(imageName);
        imageUrl = publicUrl;
      }

      // Upload video if exists
      if (videoFile) {
        const videoExt = videoFile.name.split(".").pop();
        const videoName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${videoExt}`;
        const { data: videoData, error: videoError } = await supabase.storage
          .from("works")
          .upload(videoName, videoFile);

        if (videoError) throw videoError;
        const { data: { publicUrl } } = supabase.storage
          .from("works")
          .getPublicUrl(videoName);
        videoUrl = publicUrl;
      }

      // Upload file if exists
      if (fileFile) {
        const fileExt = fileFile.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data: fileData, error: fileError } = await supabase.storage
          .from("works")
          .upload(fileName, fileFile);

        if (fileError) throw fileError;
        const { data: { publicUrl } } = supabase.storage
          .from("works")
          .getPublicUrl(fileName);
        fileUrl = publicUrl;
      }

      // Insert work into database
      const { error: insertError } = await supabase
        .from("works")
        .insert({
          title: title.trim(),
          content: content.trim(),
          category,
          author_name: memberName,
          image_url: imageUrl,
          video_url: videoUrl,
          file_url: fileUrl,
          likes_count: 0,
          comments_count: 0,
        });

      if (insertError) throw insertError;

      alert("Karya berhasil diupload!");
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error uploading work:", error);
      alert("Terjadi kesalahan saat mengupload karya");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upload Karya Baru</CardTitle>
              <CardDescription>
                Pilih kategori dan upload karya Anda
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori Karya</Label>
              <Select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Judul Karya</Label>
              <Input
                id="title"
                placeholder="Masukkan judul karya"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Isi/Konten</Label>
              <Textarea
                id="content"
                placeholder="Tulis isi karya Anda..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Gambar/Foto (Opsional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="relative w-full h-48 mt-2">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain rounded-md border"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="video">Video (Opsional)</Label>
              <Input
                id="video"
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">File/Dokumen (Opsional)</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setFileFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={uploading} className="flex-1">
                <UploadIcon className="h-4 w-4 mr-2" />
                {uploading ? "Mengupload..." : "Upload Karya"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
