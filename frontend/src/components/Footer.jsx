import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="relative z-10 bg-black/80 border-t border-gray-800 py-8 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="text-gray-400 text-sm">
            © 2024 Triple Barrel Racing. All rights reserved.
          </div>

          {/* Social Links / Info */}
          <div className="text-gray-400 text-sm">
            Underground Drift Culture · Street Racing
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
