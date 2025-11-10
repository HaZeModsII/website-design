import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, User, ArrowLeft } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Helper function to get full image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('/uploads')) return `${BACKEND_URL}${imageUrl}`;
  return imageUrl;
};

export default function BlogPostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${API}/blog/${postId}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load blog post');
      navigate('/blog');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center pt-24">
        <div className="text-2xl text-blue-500 animate-pulse">LOADING...</div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          onClick={() => navigate('/blog')}
          className="mb-6 drift-button px-4 py-2 bg-transparent hover:bg-white/10 text-white font-bold rounded-none border-2 border-white"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          <ArrowLeft className="mr-2" size={16} />
          BACK TO BLOG
        </Button>

        {/* Post Header */}
        <div className="drift-card p-8 rounded-lg mb-8">
          {/* Category Badge */}
          <span className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded mb-4">
            {post.category.toUpperCase()}
          </span>
          
          {/* Title */}
          <h1 
            className="text-5xl font-bold mb-6"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            {post.title}
          </h1>
          
          {/* Meta Info */}
          <div className="flex items-center gap-6 text-gray-400">
            <div className="flex items-center gap-2">
              <User size={18} />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Images Gallery */}
        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {post.images.map((image, index) => (
              <img 
                key={index}
                src={getImageUrl(image)} 
                alt={`${post.title} - ${index + 1}`}
                className="w-full h-64 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        {/* Post Content - Markdown */}
        <div className="drift-card p-8 rounded-lg">
          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-4xl font-bold mb-4 mt-8" style={{ fontFamily: 'Bebas Neue, sans-serif' }} {...props} />,
                h2: ({node, ...props}) => <h2 className="text-3xl font-bold mb-3 mt-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }} {...props} />,
                h3: ({node, ...props}) => <h3 className="text-2xl font-bold mb-2 mt-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }} {...props} />,
                p: ({node, ...props}) => <p className="text-gray-300 mb-4 leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 underline" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 my-4" {...props} />,
                code: ({node, inline, ...props}) => 
                  inline 
                    ? <code className="bg-gray-800 px-2 py-1 rounded text-blue-400" {...props} />
                    : <code className="block bg-gray-800 p-4 rounded my-4 overflow-x-auto" {...props} />,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
