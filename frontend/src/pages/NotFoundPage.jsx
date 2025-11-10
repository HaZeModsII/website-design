import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden flex items-center justify-center">
      {/* Tire marks background */}
      <div className="tire-marks" />
      
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 text-center px-4 max-w-2xl">
        {/* 404 */}
        <h1 
          className="text-9xl sm:text-[12rem] font-bold neon-glow mb-4"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          data-testid="404-title"
        >
          404
        </h1>
        
        {/* Message */}
        <h2 
          className="text-4xl sm:text-5xl font-bold mb-6"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          PAGE NOT FOUND
        </h2>
        
        <p className="text-xl text-gray-400 mb-12">
          Looks like you drifted off course! This page doesn't exist.
        </p>
        
        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            data-testid="go-home-btn"
            onClick={() => navigate('/')}
            className="drift-button px-12 py-6 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-none border-2 border-blue-500"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            GO HOME
          </Button>
        </div>
        
        {/* Quick Links */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <p className="text-gray-500 mb-4">Quick Links:</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate('/events')} className="text-blue-400 hover:text-blue-300 transition-colors">
              Events
            </button>
            <span className="text-gray-700">|</span>
            <button onClick={() => navigate('/store')} className="text-blue-400 hover:text-blue-300 transition-colors">
              Merch
            </button>
            <span className="text-gray-700">|</span>
            <button onClick={() => navigate('/parts')} className="text-blue-400 hover:text-blue-300 transition-colors">
              Parts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
