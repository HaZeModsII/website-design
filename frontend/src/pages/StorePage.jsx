import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ContactModal from "@/components/ContactModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function StorePage() {
  const [merchItems, setMerchItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState({});

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

  const handlePurchase = (item) => {
    // Only check for size if item has sizes defined
    if (item.sizes && item.sizes.length > 0) {
      const size = selectedSize[item.id];
      if (!size) {
        toast.error('Please select a size');
        return;
      }
      setSelectedItem({ ...item, selectedSize: size });
    } else {
      setSelectedItem(item);
    }
    setContactModalOpen(true);
  };

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
                      <span className="text-blue-500 text-2xl font-bold">OUT OF STOCK</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    {item.name}
                  </h3>
                  <p className="text-gray-400 mb-4 text-sm">{item.description}</p>
                  
                  {/* Size Selector - Only show if item has sizes */}
                  {item.sizes && item.sizes.length > 0 && (
                    <div className="mb-4">
                      <label className="text-sm text-gray-400 mb-2 block">Select Size:</label>
                      <Select 
                        value={selectedSize[item.id] || ''} 
                        onValueChange={(value) => setSelectedSize({...selectedSize, [item.id]: value})}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white" data-testid={`size-select-${item.id}`}>
                          <SelectValue placeholder="Choose size" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          {item.sizes.map(size => (
                            <SelectItem key={size} value={size}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-blue-500">${item.price} CAD</span>
                    <Button
                      data-testid={`purchase-${item.id}-btn`}
                      onClick={() => handlePurchase(item)}
                      disabled={item.stock === 0}
                      className="drift-button px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
        inquiryType="order"
        prefilledMessage={selectedItem ? `I'd like to order: ${selectedItem.name} - Size: ${selectedItem.selectedSize}` : ''}
        itemDetails={selectedItem}
      />
    </div>
  );
}
