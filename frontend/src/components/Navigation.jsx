import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" data-testid="nav-home-link" className="flex items-center">
          <img 
            src="https://customer-assets.emergentagent.com/job_jdm-legends-2/artifacts/ehzw5qae_fixedwhitetext.png"
            alt="Triple Barrel Racing"
            className="h-8 w-auto hover:opacity-80 transition-opacity"
            style={{ transform: 'scale(2.5)', transformOrigin: 'left center' }}
          />
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/" data-testid="nav-home-btn">
            <Button
              className={`px-4 py-2 font-bold rounded-none border-2 transition-colors ${
                isActive('/')
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:border-blue-500'
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
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:border-blue-500'
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
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:border-blue-500'
              }`}
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              MERCH
            </Button>
          </Link>
          <Link to="/parts" data-testid="nav-parts-btn">
            <Button
              className={`px-4 py-2 font-bold rounded-none border-2 transition-colors ${
                isActive('/parts')
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:border-blue-500'
              }`}
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              PARTS
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
