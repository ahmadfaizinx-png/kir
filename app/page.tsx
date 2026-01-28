import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users } from "lucide-react";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-green-700 mb-4">
            Web Karya KIR
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Platform untuk melihat dan memposting karya KIR
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link href="/reader">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-8 w-8 text-green-600" />
                  <CardTitle className="text-2xl">Saya Sebagai Pembaca</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Lihat semua karya yang diposting oleh anggota KIR
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Jelajahi berbagai karya seperti eksperimen, fakta, kata-kata motivasi, berita terkini, dan karya lainnya
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/member/login">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-8 w-8 text-green-600" />
                  <CardTitle className="text-2xl">Saya Sebagai Anggota KIR</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Login untuk memposting karya Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Upload karya Anda seperti eksperimen, fakta, cerpen, puisi, dan karya lainnya
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
