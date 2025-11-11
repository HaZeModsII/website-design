import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Helper function to get full image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('/uploads') || imageUrl.startsWith('/api/uploads')) return `${BACKEND_URL}${imageUrl}`;
  return imageUrl;
};

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/merch/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
      navigate('/store');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = () => {
    if (!product) return;

    // Check for size if item has sizes
    if (product.sizes && typeof product.sizes === 'object' && Object.keys(product.sizes).length > 0) {
      if (!selectedSize) {
        toast.error('Please select a size');
        return;
      }
      if (product.sizes[selectedSize] === 0) {
        toast.error('Selected size is out of stock');
        return;
      }
      navigate('/checkout', { state: { item: product, selectedSize } });
    } else {
      if (product.stock === 0) {
        toast.error('Item is out of stock');
        return;
      }
      navigate('/checkout', { state: { item: product } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-2xl text-blue-500 animate-pulse">LOADING...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-2xl text-gray-500">Product not found</div>
      </div>
    );
  }

  // Ensure image_urls is an array, fallback for backward compatibility
  const images = Array.isArray(product.image_urls) && product.image_urls.length > 0 
    ? product.image_urls 
    : [];

  const hasStock = product.sizes && typeof product.sizes === 'object' && Object.keys(product.sizes).length > 0
    ? Object.values(product.sizes).some(stock => stock > 0)
    : product.stock > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-24 pb-16 px-4">
      <div className="tire-marks" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Back Button */}
        <Button
          onClick={() => navigate('/store')}
          className="mb-6 drift-button px-4 py-2 bg-transparent hover:bg-blue-600 text-white font-bold rounded-none border-2 border-blue-500 flex items-center gap-2"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          <ChevronLeft size={20} />
          BACK TO STORE
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden relative">
              {images.length > 0 ? (
                <img
                  src={getImageUrl(images[selectedImageIndex])}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No image available
                </div>
              )}
              
              {/* Sale Badge */}
              {product.discount_percent > 0 && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg">
                  {product.discount_percent}% OFF
                </div>
              )}
              
              {/* Out of Stock Badge */}
              {!hasStock && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <span className="text-blue-500 text-3xl font-bold">OUT OF STOCK</span>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-blue-500 scale-105'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 
                className="text-5xl font-bold neon-glow mb-2"
                style={{ fontFamily: 'Bebas Neue, sans-serif' }}
              >
                {product.name}
              </h1>
              <p className="text-blue-400 text-lg">{product.category}</p>
            </div>

            {/* Price */}
            <div className="py-4 border-y border-gray-700">
              {product.effective_price && product.effective_price < product.price ? (
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-bold text-red-500">${product.effective_price}</span>
                    <span className="text-2xl text-gray-400 line-through">${product.price}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-lg text-red-400 font-bold">
                      SAVE ${(product.price - product.effective_price).toFixed(2)}!
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-5xl font-bold text-blue-500">${product.price}</span>
              )}
              <span className="text-xl text-gray-400 ml-2">CAD</span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                DESCRIPTION
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Size Selector */}
            {product.sizes && typeof product.sizes === 'object' && Object.keys(product.sizes).length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                  SELECT SIZE
                </h3>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-lg py-6">
                    <SelectValue placeholder="Choose a size" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {Object.entries(product.sizes).map(([size, stock]) => (
                      <SelectItem 
                        key={size} 
                        value={size}
                        disabled={stock === 0}
                        className="text-lg"
                      >
                        {size} {stock === 0 ? '(Out of Stock)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Stock Info for non-sized items - Only show if out of stock */}
            {(!product.sizes || Object.keys(product.sizes).length === 0) && product.stock === 0 && (
              <div>
                <p className="text-red-400 text-lg font-bold">
                  Out of stock
                </p>
              </div>
            )}

            {/* Purchase Button */}
            <Button
              onClick={handlePurchase}
              disabled={
                !hasStock ||
                (product.sizes && typeof product.sizes === 'object' && Object.keys(product.sizes).length > 0 && 
                  (!selectedSize || product.sizes[selectedSize] === 0))
              }
              className="w-full drift-button py-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-2xl"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              {hasStock ? 'BUY NOW' : 'OUT OF STOCK'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
