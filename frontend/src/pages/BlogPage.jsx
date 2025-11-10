import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, User, FolderOpen } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Helper function to get full image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('/uploads')) return `${BACKEND_URL}${imageUrl}`;
  return imageUrl;
};

export default function BlogPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      const url = selectedCategory === 'all' 
        ? `${API}/blog` 
        : `${API}/blog?category=${selectedCategory}`;
      const response = await axios.get(url);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const categories = ['all', 'events', 'new merch', 'new sponsors', 'announcements', 'team updates'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center pt-24">
        <div className="text-2xl text-blue-500 animate-pulse">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 
          className="text-6xl font-bold mb-8 text-center neon-glow"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          TEAM BLOG
        </h1>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map(cat => (
            <Button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 font-bold rounded-none border-2 transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-transparent border-gray-600 text-gray-400 hover:border-blue-500 hover:text-white'
              }`}
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              {cat.toUpperCase()}
            </Button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <p className="text-xl">No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <div 
                key={post.id} 
                className="drift-card rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate(`/blog/${post.id}`)}
              >
                {/* Featured Image */}
                {post.images && post.images.length > 0 && (
                  <img 
                    src={post.images[0]} 
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                
                <div className="p-6">
                  {/* Category Badge */}
                  <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded mb-3">
                    {post.category.toUpperCase()}
                  </span>
                  
                  {/* Title */}
                  <h2 
                    className="text-2xl font-bold mb-3 line-clamp-2"
                    style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                  >
                    {post.title}
                  </h2>
                  
                  {/* Excerpt */}
                  <p className="text-gray-400 mb-4 line-clamp-3">
                    {post.content.substring(0, 150)}...
                  </p>
                  
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                  
                  <Button
                    className="mt-4 w-full drift-button px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500"
                    style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                  >
                    READ MORE
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
