import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ContactModal from "@/components/ContactModal";
import { Search } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PartsPage() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const response = await axios.get(`${API}/parts`);
      setParts(response.data);
    } catch (error) {
      console.error('Error fetching parts:', error);
      toast.error('Failed to load parts');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(parts.map(part => part.category || 'Other'))];
  const filteredParts = selectedCategory === 'all' 
    ? parts 
    : parts.filter(part => (part.category || 'Other') === selectedCategory);

  const getConditionBadge = (condition) => {
    const badges = {
      'new': 'bg-green-600',
      'used-excellent': 'bg-blue-600',
      'used-good': 'bg-yellow-600',
      'used-fair': 'bg-orange-600'
    };
    return badges[condition] || 'bg-gray-600';
  };

  const handleInquiry = (part) => {
    setSelectedPart(part);
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
            data-testid="parts-title"
          >
            CAR PART OUTS
          </h1>
          <p className="text-xl text-gray-400">Quality Performance Parts from Our Builds</p>
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

        {/* Parts Grid */}
        {filteredParts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">No parts available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredParts.map(part => (
              <div key={part.id} className="drift-card rounded-lg overflow-hidden" data-testid={`part-item-${part.id}`}>
                <div className="aspect-square bg-gray-800 relative overflow-hidden">
                  <img 
                    src={part.image_url} 
                    alt={part.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  {part.stock === 0 && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <span className="text-blue-500 text-2xl font-bold">SOLD OUT</span>
                    </div>
                  )}
                  <div className={`absolute top-4 right-4 ${getConditionBadge(part.condition)} px-3 py-1 rounded text-sm font-bold`}>
                    {part.condition.toUpperCase().replace('-', ' ')}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    {part.name}
                  </h3>
                  <div className="text-sm text-gray-400 mb-3">
                    <p><strong>Model:</strong> {part.car_model}</p>
                    <p><strong>Year:</strong> {part.year}</p>
                  </div>
                  <p className="text-gray-400 mb-4 text-sm">{part.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-blue-500">${part.price} CAD</span>
                    <Button
                      data-testid={`inquire-${part.id}-btn`}
                      onClick={() => handleInquiry(part)}
                      disabled={part.stock === 0}
                      className="drift-button px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                    >
                      INQUIRE
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
          setSelectedPart(null);
        }}
        inquiryType="parts"
        prefilledMessage={selectedPart ? `I'm interested in: ${selectedPart.name} (${selectedPart.car_model} ${selectedPart.year})` : ''}
        itemDetails={selectedPart}
      />
    </div>
  );
}
