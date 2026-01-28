import { Phone, Mail, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-6">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Web Karya KIR</h3>
            <p className="text-sm">
              Platform untuk melihat dan memposting karya KIR
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Kontak</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:0882021963545" className="hover:text-white">
                  0882021963545
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:ahmad.faizin.x" className="hover:text-white">
                  ahmad.faizin.x
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                <a
                  href="https://instagram.com/ahmad_faizin_x"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  ahmad_faizin_x
                </a>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Developer</h3>
            <p className="text-sm">AHMAD FAIZIN</p>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Web Karya KIR. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
