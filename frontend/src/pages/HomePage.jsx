import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${API}/merch`);
      const featured = response.data.filter(item => item.featured);
      setFeaturedProducts(featured);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Tire marks background */}
      <div className="tire-marks" />
      
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo with floating animation and glow */}
        <div className="mb-12 relative logo-float">
          <img 
            src="https://customer-assets.emergentagent.com/job_jdm-legends-2/artifacts/3debsbpu_fixedcolourskull.png"
            alt="Triple Barrel Racing Logo"
            className="w-[32rem] sm:w-[40rem] lg:w-[48rem] h-auto logo-glow mx-auto"
            data-testid="logo-image"
          />
          <img 
            src="https://customer-assets.emergentagent.com/job_jdm-legends-2/artifacts/ehzw5qae_fixedwhitetext.png"
            alt="Triple Barrel Racing Text"
            className="w-72 sm:w-96 lg:w-[28rem] h-auto logo-glow mx-auto"
            data-testid="logo-text"
          />
        </div>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl text-gray-400 mb-12 text-center max-w-2xl">
          Underground Drift Culture · Street Racing · Pure Adrenaline
        </p>

        {/* CTA Buttons - Flipped order */}
        <div className="flex flex-col sm:flex-row gap-6">
          <Button
            data-testid="shop-merch-btn"
            onClick={() => navigate('/store')}
            className="drift-button px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-none border-2 border-blue-500"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            SHOP MERCH
          </Button>
          <Button
            data-testid="view-events-btn"
            onClick={() => navigate('/events')}
            className="drift-button px-8 py-6 text-lg bg-transparent hover:bg-white/10 text-white font-bold rounded-none border-2 border-white"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            VIEW EVENTS
          </Button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 flex flex-col items-center animate-bounce">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <p className="text-blue-500 text-xs mt-2 font-bold">SCROLL</p>
        </div>
      </div>

      {/* About Section */}
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <button 
              onClick={() => navigate('/events')}
              className="drift-card p-8 rounded-lg text-center cursor-pointer transition-all hover:scale-105"
              data-testid="about-events-btn"
            >
              <div className="text-5xl mb-4 text-blue-500">🏁</div>
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>DRIFT EVENTS</h3>
              <p className="text-gray-400">Experience the thrill of professional drifting at our underground events</p>
            </button>
            <button 
              onClick={() => navigate('/store')}
              className="drift-card p-8 rounded-lg text-center cursor-pointer transition-all hover:scale-105"
              data-testid="about-merch-btn"
            >
              <div className="text-5xl mb-4 text-cyan-500">👕</div>
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>EXCLUSIVE MERCH</h3>
              <p className="text-gray-400">Rep the team with our limited edition gear and accessories</p>
            </button>
            <button 
              onClick={() => navigate('/parts')}
              className="drift-card p-8 rounded-lg text-center cursor-pointer transition-all hover:scale-105"
              data-testid="about-parts-btn"
            >
              <div className="text-5xl mb-4 text-yellow-500">🔧</div>
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>PART OUTS</h3>
              <p className="text-gray-400">Quality performance parts from our drift builds and projects</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
