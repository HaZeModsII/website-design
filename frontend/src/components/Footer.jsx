import { useNavigate } from "react-router-dom";
import { Lock, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="relative z-10 bg-black/80 border-t border-gray-800 py-8 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="text-gray-400 text-sm">
            © 2024 Triple Barrel Racing. All rights reserved.
          </div>

          {/* Center Section - Info + Social Links */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-gray-400 text-sm">
              Underground Drift Culture · Street Racing
            </div>
            
            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/triplebarrelracing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors"
                title="Follow us on Instagram"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61581191677901"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title="Follow us on Facebook"
              >
                <Facebook size={24} />
              </a>
            </div>
          </div>

          {/* Admin Access Icon */}
          <button
            onClick={() => navigate('/admin')}
            data-testid="footer-admin-btn"
            className="group flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors text-sm"
            title="Admin Panel"
          >
            <Lock size={16} className="group-hover:animate-pulse" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
