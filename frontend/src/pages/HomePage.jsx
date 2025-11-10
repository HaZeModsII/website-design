import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const navigate = useNavigate();

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
        <div className="mb-12 relative flex flex-col items-center">
          <div className="logo-float mb-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_jdm-legends-2/artifacts/ka2d0c5n_colourskull.png"
              alt="Triple Barrel Racing Logo"
              className="w-64 sm:w-80 lg:w-96 h-auto logo-glow"
              data-testid="logo-image"
            />
          </div>
          <div className="logo-glow">
            <img 
              src="https://customer-assets.emergentagent.com/job_jdm-legends-2/artifacts/ctazltxf_whitetextarch.png"
              alt="Triple Barrel Racing Text"
              className="w-72 sm:w-96 lg:w-[28rem] h-auto"
              data-testid="logo-text"
            />
          </div>
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
        <div className="absolute bottom-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-blue-500 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-blue-500 rounded-full animate-pulse" />
          </div>
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
            <div className="drift-card p-8 rounded-lg text-center">
              <div className="text-5xl mb-4 text-yellow-500">🏆</div>
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>RACING CULTURE</h3>
              <p className="text-gray-400">Join the community of street racing enthusiasts and drift lovers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
