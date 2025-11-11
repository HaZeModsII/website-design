import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Helper function to get full image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('/uploads') || imageUrl.startsWith('/api/uploads')) return `${BACKEND_URL}${imageUrl}`;
  return imageUrl;
};

export default function StorePage() {
  const navigate = useNavigate();
  const [merchItems, setMerchItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMerch();
  }, []);

  const fetchMerch = async () => {
    try {
      const response = await axios.get(`${API}/merch`);
      setMerchItems(response.data);
    } catch (error) {
      console.error('Error fetching merch:', error);
      toast.error('Failed to load merchandise');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(merchItems.map(item => item.category))];
  
  // Filter by category and search
  const filteredItems = merchItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-2xl text-blue-500 animate-pulse">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-24 pb-16 px-4">
      <div className="tire-marks" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-6xl sm:text-7xl font-bold neon-glow mb-4"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            data-testid="store-title"
          >
            MERCH STORE
          </h1>
          <p className="text-xl text-gray-400">Official Triple Barrel Racing Gear</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search merchandise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 bg-gray-800 border-gray-700 text-white placeholder-gray-400 text-lg"
              data-testid="search-input"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          {categories.map(category => (
            <Button
              key={category}
              data-testid={`category-${category}-btn`}
              onClick={() => setSelectedCategory(category)}
              className={`drift-button px-6 py-2 rounded-none border-2 font-bold ${
                selectedCategory === category
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-transparent border-gray-600 text-gray-400 hover:border-blue-500 hover:text-white'
              }`}
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              {category.toUpperCase()}
            </Button>
          ))}
        </div>

        {/* Merch Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">No items available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => {
              // Get first image from image_urls array, fallback to empty string
              const mainImage = Array.isArray(item.image_urls) && item.image_urls.length > 0 
                ? item.image_urls[0] 
                : '';
              
              return (
                <div key={item.id} className="drift-card rounded-lg overflow-hidden" data-testid={`merch-item-${item.id}`}>
                  {/* Clickable Image to navigate to product detail */}
                  <div 
                    className="aspect-square bg-gray-800 relative overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    <img 
                      src={getImageUrl(mainImage)} 
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                    {/* Sale Badge */}
                    {item.discount_percent > 0 && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm">
                        {item.discount_percent}% OFF
                      </div>
                    )}
                    {/* Show OUT OF STOCK if all sizes are 0 or item stock is 0 */}
                    {((item.sizes && typeof item.sizes === 'object' && Object.keys(item.sizes).length > 0 
                        && Object.values(item.sizes).every(stock => stock === 0)) 
                      || ((!item.sizes || Object.keys(item.sizes).length === 0) && item.stock === 0)) && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                        <span className="text-blue-500 text-2xl font-bold">OUT OF STOCK</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 
                      className="text-2xl font-bold mb-2 cursor-pointer hover:text-blue-400 transition-colors" 
                      style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      {item.name}
                    </h3>
                    <p className="text-gray-400 mb-4 text-sm line-clamp-2">{item.description}</p>

                    <div className="flex items-center justify-between">
                      <div>
                        {item.effective_price && item.effective_price < item.price ? (
                          <div>
                            <span className="text-3xl font-bold text-red-500">${item.effective_price} CAD</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-400 line-through">${item.price} CAD</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-3xl font-bold text-blue-500">${item.price} CAD</span>
                        )}
                      </div>
                      <Button
                        data-testid={`view-details-${item.id}-btn`}
                        onClick={() => navigate(`/product/${item.id}`)}
                        className="drift-button px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500"
                        style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                      >
                        VIEW DETAILS
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
