import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" data-testid="nav-home-link">
          <h2 
            className="text-2xl font-bold text-red-500 hover:text-red-400 transition-colors"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            TRIPLE BARREL RACING
          </h2>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/" data-testid="nav-home-btn">
            <Button
              className={`px-4 py-2 font-bold rounded-none border-2 transition-colors ${
                isActive('/')
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:border-red-500'
              }`}
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              HOME
            </Button>
          </Link>
          <Link to="/events" data-testid="nav-events-btn">
            <Button
              className={`px-4 py-2 font-bold rounded-none border-2 transition-colors ${
                isActive('/events')
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:border-red-500'
              }`}
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              EVENTS
            </Button>
          </Link>
          <Link to="/store" data-testid="nav-store-btn">
            <Button
              className={`px-4 py-2 font-bold rounded-none border-2 transition-colors ${
                isActive('/store')
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:border-red-500'
              }`}
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              STORE
            </Button>
          </Link>
          <Link to="/admin" data-testid="nav-admin-btn">
            <Button
              className={`px-4 py-2 font-bold rounded-none border-2 transition-colors ${
                isActive('/admin')
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:border-red-500'
              }`}
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              ADMIN
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
