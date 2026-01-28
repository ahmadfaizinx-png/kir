"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, Home, Upload } from "lucide-react";
import Link from "next/link";
import UploadWorkModal from "@/components/UploadWorkModal";
import Footer from "@/components/Footer";

export default function MemberDashboardPage() {
  const [isMember, setIsMember] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in as member
    const memberStatus = sessionStorage.getItem("kir_member");
    const name = sessionStorage.getItem("kir_member_name");

    if (memberStatus !== "true" || !name) {
      router.push("/member/login");
      return;
    }

    setIsMember(true);
    setMemberName(name);
  }, [router]);

  function handleLogout() {
    sessionStorage.removeItem("kir_member");
    sessionStorage.removeItem("kir_member_name");
    router.push("/");
  }

  if (!isMember) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <h1 className="text-2xl font-bold text-green-700">Web Karya KIR</h1>
              </Link>
              <span className="text-sm text-gray-600">Dashboard Anggota</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Halo, {memberName}</span>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Beranda
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Dashboard Anggota KIR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Selamat datang di dashboard anggota. Anda dapat mengupload karya Anda di sini.
            </p>
            <Button onClick={() => setShowUploadModal(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Tambahkan Karya
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowUploadModal(true)}>
            <CardHeader>
              <Upload className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Upload Karya</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Upload karya baru seperti eksperimen, fakta, cerpen, puisi, dan lainnya
              </p>
            </CardContent>
          </Card>

          <Link href="/reader">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Home className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Lihat Semua Karya</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Lihat semua karya yang telah diupload
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {showUploadModal && (
        <UploadWorkModal
          onClose={() => setShowUploadModal(false)}
          memberName={memberName}
        />
      )}
      <Footer />
    </div>
  );
}
