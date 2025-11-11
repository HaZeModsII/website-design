import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Helper function to get full image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('/uploads')) return `${BACKEND_URL}${imageUrl}`;
  return imageUrl;
};

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
      {/* Hero Logo Section */}
      <div className="relative w-[48rem] h-[48rem] mx-auto logo-float">
        {/* Main Logo */}
        <img 
          src="https://customer-assets.emergentagent.com/job_jdm-legends-2/artifacts/3debsbpu_fixedcolourskull.png"
          alt="Triple Barrel Racing Logo"
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[32rem] sm:w-[40rem] lg:w-[48rem] h-auto logo-glow"
          data-testid="logo-image"
        />
      </div>

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

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="w-full max-w-6xl mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              FEATURED PRODUCTS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.slice(0, 3).map(product => {
                const mainImage = Array.isArray(product.image_urls) && product.image_urls.length > 0 
                  ? product.image_urls[0] 
                  : '';
                
                return (
                  <div 
                    key={product.id}
                    onClick={() => navigate('/store')}
                    className="drift-card rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                  >
                    <div className="relative">
                      <img 
                        src={getImageUrl(mainImage)} 
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                    {product.discount_percent > 0 && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm">
                        {product.discount_percent}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      {product.name}
                    </h3>
                    <div className="flex justify-between items-center">
                      {product.effective_price && product.effective_price < product.price ? (
                        <div>
                          <div className="text-2xl font-bold text-red-500">${product.effective_price}</div>
                          <div className="text-xs text-gray-400 line-through">${product.price}</div>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-blue-500">${product.price}</span>
                      )}
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded">FEATURED</span>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

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
