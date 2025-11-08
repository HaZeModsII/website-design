import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ContactModal from "@/components/ContactModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function StorePage() {
  const [merchItems, setMerchItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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
  const filteredItems = selectedCategory === 'all' 
    ? merchItems 
    : merchItems.filter(item => item.category === selectedCategory);

  const handlePurchase = (item) => {
    setSelectedItem(item);
    setContactModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-2xl text-red-500 animate-pulse">LOADING...</div>
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

        {/* Category Filter */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          {categories.map(category => (
            <Button
              key={category}
              data-testid={`category-${category}-btn`}
              onClick={() => setSelectedCategory(category)}
              className={`drift-button px-6 py-2 rounded-none border-2 font-bold ${
                selectedCategory === category
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-transparent border-gray-600 text-gray-400 hover:border-red-500 hover:text-white'
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
            {filteredItems.map(item => (
              <div key={item.id} className="drift-card rounded-lg overflow-hidden" data-testid={`merch-item-${item.id}`}>
                <div className="aspect-square bg-gray-800 relative overflow-hidden">
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  {item.stock === 0 && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <span className="text-red-500 text-2xl font-bold">OUT OF STOCK</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    {item.name}
                  </h3>
                  <p className="text-gray-400 mb-4 text-sm">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-red-500">${item.price}</span>
                    <Button
                      data-testid={`purchase-${item.id}-btn`}
                      onClick={() => handlePurchase(item)}
                      disabled={item.stock === 0}
                      className="drift-button px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-none border-2 border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                    >
                      BUY NOW
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ContactModal 
        open={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setSelectedItem(null);
        }}
        inquiryType="general"
        prefilledMessage={selectedItem ? `I'm interested in purchasing: ${selectedItem.name}` : ''}
      />
    </div>
  );
}
