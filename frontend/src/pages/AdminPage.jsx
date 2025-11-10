import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Helper function to get full image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('/uploads')) return `${BACKEND_URL}${imageUrl}`;
  return imageUrl;
};

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [merchItems, setMerchItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [parts, setParts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  
  const [newMerch, setNewMerch] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: 'T-Shirts',
    stock: '',
    sizes: {},  // Object mapping size to stock: { "S": 10, "M": 15 }
    featured: false,
    sale_percent: null
  });
  
  const [editingMerch, setEditingMerch] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Event image state
  const [eventImageFile, setEventImageFile] = useState(null);
  const [eventImagePreview, setEventImagePreview] = useState(null);
  
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    image_url: '',
    ticket_price: ''
  });

  
  // Part image state
  const [partImageFile, setPartImageFile] = useState(null);
  const [partImagePreview, setPartImagePreview] = useState(null);
  
  const [newPart, setNewPart] = useState({
    name: '',
    description: '',
    price: '',
    car_model: '',
    year: '',
    category: 'Engine',
    condition: 'used-good',
    image_url: '',
    stock: '1'
  });
  
  // New entity states
  const [drivers, setDrivers] = useState([]);
  const [cars, setCars] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  
  // Sales settings state
  const [salesSettings, setSalesSettings] = useState({
    site_wide_sale: false,
    site_wide_discount_percent: 0,
    category_sales: {}
  });
  
  // Driver state and image
  const [driverImageFile, setDriverImageFile] = useState(null);
  const [driverImagePreview, setDriverImagePreview] = useState(null);
  const [newDriver, setNewDriver] = useState({
    name: '',
    bio: '',
    car_name: '',
    email: ''
  });
  
  // Car state and image
  const [carImageFile, setCarImageFile] = useState(null);
  const [carImagePreview, setCarImagePreview] = useState(null);
  const [newCar, setNewCar] = useState({
    name: '',
    year: '',
    make: '',
    model: '',
    specs: '',
    driver_name: ''
  });
  
  // Blog post state and images (multiple)
  const [blogImageFiles, setBlogImageFiles] = useState([]);
  const [blogImagePreviews, setBlogImagePreviews] = useState([]);
  const [newBlogPost, setNewBlogPost] = useState({
    title: '',
    content: '',
    category: 'events',
    author: ''
  });
  
  // Sponsor state and image
  const [sponsorImageFile, setSponsorImageFile] = useState(null);
  const [sponsorImagePreview, setSponsorImagePreview] = useState(null);
  const [newSponsor, setNewSponsor] = useState({
    name: '',
    website_url: '',
    instagram_url: '',
    facebook_url: '',
    description: ''
  });


  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
      fetchAdminData(savedToken);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/admin/login`, {
        username,
        password
      });
      
      if (response.data.success) {
        setToken(response.data.token);
        setIsLoggedIn(true);
        localStorage.setItem('admin_token', response.data.token);
        toast.success('Login successful');
        fetchAdminData(response.data.token);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken(null);
    localStorage.removeItem('admin_token');
    toast.success('Logged out');
  };

  const fetchAdminData = async (authToken) => {
    try {
      const [merchRes, eventsRes, partsRes, inquiriesRes, driversRes, carsRes, blogRes, sponsorsRes, salesRes] = await Promise.all([
        axios.get(`${API}/merch`),
        axios.get(`${API}/events`),
        axios.get(`${API}/parts`),
        axios.get(`${API}/inquiries`, {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        axios.get(`${API}/drivers`),
        axios.get(`${API}/cars`),
        axios.get(`${API}/blog`),
        axios.get(`${API}/sponsors`),
        axios.get(`${API}/sales-settings`)
      ]);
      
      setMerchItems(merchRes.data);
      setEvents(eventsRes.data);
      setParts(partsRes.data);
      setInquiries(inquiriesRes.data);
      setDrivers(driversRes.data);
      setCars(carsRes.data);
      setBlogPosts(blogRes.data);
      setSponsors(sponsorsRes.data);
      setSalesSettings(salesRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load data');
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.image_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEventImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setEventImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePartImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPartImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPartImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDriverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDriverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setDriverImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCarImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCarImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCarImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBlogImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setBlogImageFiles(files);
    
    // Create previews for all files
    const previews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === files.length) {
          setBlogImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSponsorImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSponsorImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSponsorImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddMerch = async (e) => {
    e.preventDefault();
    
    // For add mode, image is required. For edit mode, it's optional
    if (!editingMerch && !imageFile) {
      toast.error('Please select an image');
      return;
    }
    
    try {
      let imageUrl = newMerch.image_url; // Keep existing image if editing
      
      // Upload new image if file is selected
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
        if (!imageUrl) {
          toast.error('Failed to upload image');
          return;
        }
      } else if (!editingMerch) {
        // If adding new item and no file selected (shouldn't happen due to check above)
        toast.error('Please select an image');
        return;
      }
      
      const payload = {
        ...newMerch,
        image_url: imageUrl
      };
      
      // Only include price if it's set
      if (newMerch.price) {
        payload.price = parseFloat(newMerch.price);
      }
      
      // Only include sizes if object has keys, otherwise use stock
      if (payload.sizes && Object.keys(payload.sizes).length > 0) {
        payload.sizes = payload.sizes;
        payload.stock = 0;  // Stock not used for sized items
      } else {
        payload.sizes = null;
        if (newMerch.stock) {
          payload.stock = parseInt(newMerch.stock);
        }
      }
      
      if (editingMerch) {
        // Update existing item
        await axios.put(`${API}/merch/${editingMerch.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Merch item updated');
        setEditingMerch(null);
      } else {
        // Add new item
        await axios.post(`${API}/merch`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Merch item added');
      }
      
      setNewMerch({ name: '', description: '', price: '', image_url: '', category: 'T-Shirts', stock: '', sizes: {}, featured: false, sale_percent: null });
      setImageFile(null);
      setImagePreview(null);
      fetchAdminData(token);
    } catch (error) {
      console.error('Error saving merch:', error);
      toast.error('Failed to save item');
    }
  };

  const handleEditMerch = (item) => {
    setEditingMerch(item);
    setNewMerch({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image_url: item.image_url,
      category: item.category,
      stock: item.stock.toString(),
      sizes: item.sizes || {},
      featured: item.featured || false
    });
    // Use getImageUrl to show the correct preview
    setImagePreview(getImageUrl(item.image_url));
    setImageFile(null);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingMerch(null);
    setNewMerch({ name: '', description: '', price: '', image_url: '', category: 'T-Shirts', stock: '', sizes: {}, featured: false, sale_percent: null });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    
    if (!eventImageFile) {
      toast.error('Please select an image');
      return;
    }
    
    try {
      // Upload image first
      const imageUrl = await handleImageUpload(eventImageFile);
      if (!imageUrl) return;
      
      await axios.post(`${API}/events`, {
        ...newEvent,
        image_url: imageUrl,
        ticket_price: parseFloat(newEvent.ticket_price)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Event added');
      setNewEvent({ name: '', description: '', date: '', location: '', image_url: '', ticket_price: '' });
      setEventImageFile(null);
      setEventImagePreview(null);
      fetchAdminData(token);
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to add event');
    }
  };


  const handleAddPart = async (e) => {
    e.preventDefault();
    
    if (!partImageFile) {
      toast.error('Please select an image');
      return;
    }
    
    try {
      // Upload image first
      const imageUrl = await handleImageUpload(partImageFile);
      if (!imageUrl) return;
      
      await axios.post(`${API}/parts`, {
        ...newPart,
        image_url: imageUrl,
        price: parseFloat(newPart.price),
        stock: parseInt(newPart.stock)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Part added');
      setNewPart({ name: '', description: '', price: '', car_model: '', year: '', category: 'Engine', condition: 'used-good', image_url: '', stock: '1' });
      setPartImageFile(null);
      setPartImagePreview(null);
      fetchAdminData(token);
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error('Failed to add part');
    }
  };

  // Driver handlers
  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (!driverImageFile) {
      toast.error('Please select an image');
      return;
    }
    
    try {
      const imageUrl = await handleImageUpload(driverImageFile);
      if (!imageUrl) return;
      
      await axios.post(`${API}/drivers`, {
        ...newDriver,
        image_url: imageUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Driver added');
      setNewDriver({ name: '', bio: '', car_name: '', email: '' });
      setDriverImageFile(null);
      setDriverImagePreview(null);
      fetchAdminData(token);
    } catch (error) {
      console.error('Error adding driver:', error);
      toast.error('Failed to add driver');
    }
  };

  const handleDeleteDriver = async (id) => {
    try {
      await axios.delete(`${API}/drivers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Driver deleted');
      fetchAdminData(token);
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast.error('Failed to delete driver');
    }
  };

  // Car handlers
  const handleAddCar = async (e) => {
    e.preventDefault();
    if (!carImageFile) {
      toast.error('Please select an image');
      return;
    }
    
    try {
      const imageUrl = await handleImageUpload(carImageFile);
      if (!imageUrl) return;
      
      await axios.post(`${API}/cars`, {
        ...newCar,
        image_url: imageUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Car added');
      setNewCar({ name: '', year: '', make: '', model: '', specs: '', driver_name: '' });
      setCarImageFile(null);
      setCarImagePreview(null);
      fetchAdminData(token);
    } catch (error) {
      console.error('Error adding car:', error);
      toast.error('Failed to add car');
    }
  };

  const handleDeleteCar = async (id) => {
    try {
      await axios.delete(`${API}/cars/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Car deleted');
      fetchAdminData(token);
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error('Failed to delete car');
    }
  };

  // Blog post handlers
  const handleAddBlogPost = async (e) => {
    e.preventDefault();
    
    try {
      // Upload all images
      const imageUrls = [];
      for (const file of blogImageFiles) {
        const url = await handleImageUpload(file);
        if (url) imageUrls.push(url);
      }
      
      await axios.post(`${API}/blog`, {
        ...newBlogPost,
        images: imageUrls
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Blog post added');
      setNewBlogPost({ title: '', content: '', category: 'events', author: '' });
      setBlogImageFiles([]);
      setBlogImagePreviews([]);
      fetchAdminData(token);
    } catch (error) {
      console.error('Error adding blog post:', error);
      toast.error('Failed to add blog post');
    }
  };

  const handleDeleteBlogPost = async (id) => {
    try {
      await axios.delete(`${API}/blog/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Blog post deleted');
      fetchAdminData(token);
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('Failed to delete blog post');
    }
  };

  // Sponsor handlers
  const handleAddSponsor = async (e) => {
    e.preventDefault();
    if (!sponsorImageFile) {
      toast.error('Please select a logo image');
      return;
    }
    
    try {
      const imageUrl = await handleImageUpload(sponsorImageFile);
      if (!imageUrl) return;
      
      await axios.post(`${API}/sponsors`, {
        ...newSponsor,
        logo_url: imageUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Sponsor added');
      setNewSponsor({ name: '', website_url: '', instagram_url: '', facebook_url: '', description: '' });
      setSponsorImageFile(null);
      setSponsorImagePreview(null);
      fetchAdminData(token);
    } catch (error) {
      console.error('Error adding sponsor:', error);
      toast.error('Failed to add sponsor');
    }
  };

  const handleDeleteSponsor = async (id) => {
    try {
      await axios.delete(`${API}/sponsors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Sponsor deleted');
      fetchAdminData(token);
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      toast.error('Failed to delete sponsor');
    }
  };

  // Sales settings handlers
  const handleUpdateSalesSettings = async () => {
    try {
      await axios.put(`${API}/sales-settings`, salesSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Sales settings updated');
      fetchAdminData(token);
    } catch (error) {
      console.error('Error updating sales settings:', error);
      toast.error('Failed to update sales settings');
    }
  };

  const handleCategorySaleChange = (category, discount) => {
    const newCategorySales = { ...salesSettings.category_sales };
    if (discount === '' || discount === 0) {
      delete newCategorySales[category];
    } else {
      newCategorySales[category] = parseFloat(discount);
    }
    setSalesSettings({ ...salesSettings, category_sales: newCategorySales });
  };


  const handleDeleteMerch = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await axios.delete(`${API}/merch/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Delete response:', response);
      toast.success('Item deleted');
      fetchAdminData(token);
    } catch (error) {
      console.error('Error deleting merch:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.detail || 'Failed to delete item');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await axios.delete(`${API}/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Event deleted');
      fetchAdminData(token);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };


  const handleDeletePart = async (id) => {
    if (!window.confirm('Are you sure you want to delete this part?')) return;
    
    try {
      await axios.delete(`${API}/parts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Part deleted');
      fetchAdminData(token);
    } catch (error) {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    }
  };


  const handleStatusUpdate = async (inquiryId, newStatus) => {
    try {
      await axios.patch(`${API}/inquiries/${inquiryId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order status updated');
      fetchAdminData(token);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };


  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center px-4">
        <div className="drift-card p-8 rounded-lg max-w-md w-full">
          <h1 
            className="text-4xl font-bold text-center mb-8 neon-glow"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            data-testid="admin-login-title"
          >
            ADMIN LOGIN
          </h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                data-testid="admin-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                data-testid="admin-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>
            <Button
              data-testid="admin-login-btn"
              type="submit"
              className="w-full drift-button py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              LOGIN
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 
            className="text-5xl font-bold neon-glow"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            data-testid="admin-panel-title"
          >
            ADMIN PANEL
          </h1>
          <Button
            data-testid="admin-logout-btn"
            onClick={handleLogout}
            className="drift-button px-6 py-2 bg-transparent hover:bg-blue-600 text-white font-bold rounded-none border-2 border-blue-500"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            LOGOUT
          </Button>
        </div>

        <Tabs defaultValue="merch" className="space-y-6">
          <TabsList className="bg-gray-800 border-2 border-gray-700">
            <TabsTrigger value="merch" data-testid="merch-tab" className="data-[state=active]:bg-blue-600">Merchandise</TabsTrigger>
            <TabsTrigger value="sales" data-testid="sales-tab" className="data-[state=active]:bg-blue-600">Sales</TabsTrigger>
            <TabsTrigger value="events" data-testid="events-tab" className="data-[state=active]:bg-blue-600">Events</TabsTrigger>
            <TabsTrigger value="parts" data-testid="parts-tab" className="data-[state=active]:bg-blue-600">Parts</TabsTrigger>
            <TabsTrigger value="drivers" data-testid="drivers-tab" className="data-[state=active]:bg-blue-600">Drivers</TabsTrigger>
            <TabsTrigger value="cars" data-testid="cars-tab" className="data-[state=active]:bg-blue-600">Cars</TabsTrigger>
            <TabsTrigger value="blog" data-testid="blog-tab" className="data-[state=active]:bg-blue-600">Blog</TabsTrigger>
            <TabsTrigger value="sponsors" data-testid="sponsors-tab" className="data-[state=active]:bg-blue-600">Sponsors</TabsTrigger>
            <TabsTrigger value="orders" data-testid="orders-tab" className="data-[state=active]:bg-blue-600">Orders</TabsTrigger>
            <TabsTrigger value="inquiries" data-testid="inquiries-tab" className="data-[state=active]:bg-blue-600">Inquiries</TabsTrigger>
          </TabsList>

          {/* Merch Tab */}
          <TabsContent value="merch" className="space-y-6">
            <div className="drift-card p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                  {editingMerch ? 'Edit Item' : 'Add New Item'}
                </h2>
                {editingMerch && (
                  <Button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
              <form onSubmit={handleAddMerch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    data-testid="merch-name-input"
                    value={newMerch.name}
                    onChange={(e) => setNewMerch({...newMerch, name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required={!editingMerch}
                  />
                </div>
                <div>
                  <Label>Price (CAD)</Label>
                  <Input
                    data-testid="merch-price-input"
                    type="number"
                    step="0.01"
                    value={newMerch.price}
                    onChange={(e) => setNewMerch({...newMerch, price: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required={!editingMerch}
                  />
                </div>
                <div>
                  <Label>Sale Discount % (Optional)</Label>
                  <Input
                    data-testid="merch-sale-percent-input"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={newMerch.sale_percent || ''}
                    onChange={(e) => setNewMerch({...newMerch, sale_percent: e.target.value ? parseFloat(e.target.value) : null})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="e.g., 20 for 20% off"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured-checkbox"
                    checked={newMerch.featured || false}
                    onCheckedChange={(checked) => setNewMerch({...newMerch, featured: checked})}
                  />
                  <Label htmlFor="featured-checkbox" className="text-gray-300 cursor-pointer">
                    Feature on Home Page
                  </Label>
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    data-testid="merch-category-input"
                    value={newMerch.category}
                    onChange={(e) => setNewMerch({...newMerch, category: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded"
                    required={!editingMerch}
                  >
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Sweaters">Sweaters</option>
                    <option value="Hats">Hats</option>
                    <option value="Stickers">Stickers</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                {/* Stock field - only show if no sizes selected */}
                {Object.keys(newMerch.sizes).length === 0 && (
                  <div>
                    <Label>Stock</Label>
                    <Input
                      data-testid="merch-stock-input"
                      type="number"
                      value={newMerch.stock}
                      onChange={(e) => setNewMerch({...newMerch, stock: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white"
                      required={!editingMerch}
                    />
                  </div>
                )}
                <div className="md:col-span-2">
                  <Label>Product Image {editingMerch && '(Optional - leave empty to keep current)'}</Label>
                  <Input
                    data-testid="merch-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="bg-gray-800 border-gray-700 text-white"
                    required={!editingMerch}
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded border-2 border-gray-700" />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    data-testid="merch-description-input"
                    value={newMerch.description}
                    onChange={(e) => setNewMerch({...newMerch, description: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required={!editingMerch}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="mb-3 block">Sizes & Stock (Optional - for clothing items)</Label>
                  <div className="space-y-3" data-testid="size-checkboxes">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => (
                      <div key={size} className="flex items-center gap-4">
                        <Checkbox
                          id={`size-${size}`}
                          checked={size in newMerch.sizes}
                          onCheckedChange={(checked) => {
                            const newSizes = {...newMerch.sizes};
                            if (checked) {
                              newSizes[size] = 0;
                            } else {
                              delete newSizes[size];
                            }
                            setNewMerch({...newMerch, sizes: newSizes});
                          }}
                        />
                        <label
                          htmlFor={`size-${size}`}
                          className="text-sm font-medium w-12 text-gray-300 cursor-pointer"
                        >
                          {size}
                        </label>
                        {size in newMerch.sizes && (
                          <div className="flex items-center gap-2 flex-1">
                            <Label htmlFor={`stock-${size}`} className="text-gray-400 text-sm">Stock:</Label>
                            <Input
                              id={`stock-${size}`}
                              type="number"
                              min="0"
                              placeholder="0"
                              value={newMerch.sizes[size] === 0 ? '' : newMerch.sizes[size]}
                              onChange={(e) => {
                                const newSizes = {...newMerch.sizes};
                                const value = e.target.value;
                                newSizes[size] = value === '' ? 0 : parseInt(value);
                                setNewMerch({...newMerch, sizes: newSizes});
                              }}
                              className="bg-gray-800 border-gray-700 text-white w-24"
                              data-testid={`stock-${size}-input`}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {Object.keys(newMerch.sizes).length > 0 && (
                    <p className="text-sm text-blue-400 mt-3">
                      Total Stock: {Object.values(newMerch.sizes).reduce((sum, stock) => sum + stock, 0)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Check sizes for clothing items and set stock per size. Leave unchecked for non-clothing items.</p>
                </div>
                <div className="md:col-span-2">
                  <Button 
                    data-testid="add-merch-btn"
                    type="submit" 
                    disabled={uploadingImage}
                    className="drift-button px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500 disabled:opacity-50"
                    style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                  >
                    {uploadingImage ? 'UPLOADING...' : (editingMerch ? 'UPDATE ITEM' : 'ADD ITEM')}
                  </Button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Current Items</h2>
              {merchItems.map(item => {
                const totalStock = item.sizes && typeof item.sizes === 'object' 
                  ? Object.values(item.sizes).reduce((sum, stock) => sum + stock, 0)
                  : item.stock;
                
                return (
                  <div key={item.id} className="drift-card p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{item.name}</h3>
                        {item.featured && (
                          <span className="px-2 py-1 bg-yellow-600 text-white text-xs font-bold rounded">FEATURED</span>
                        )}
                      </div>
                      <p className="text-gray-400">${item.price} CAD - {item.category} - Total Stock: {totalStock}</p>
                      {item.sizes && typeof item.sizes === 'object' && Object.keys(item.sizes).length > 0 && (
                        <p className="text-blue-400 text-sm mt-1">
                          Sizes: {Object.entries(item.sizes).map(([size, stock]) => `${size} (${stock})`).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid={`edit-merch-${item.id}-btn`}
                        onClick={() => handleEditMerch(item)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Edit
                      </Button>
                      <Button
                        data-testid={`delete-merch-${item.id}-btn`}
                        onClick={() => handleDeleteMerch(item.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            <div className="drift-card p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Sales Management</h2>
              
              {/* Site-Wide Sale */}
              <div className="mb-8 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Site-Wide Sale</h3>
                <div className="flex items-center gap-4 mb-4">
                  <Checkbox
                    id="site-wide-sale"
                    checked={salesSettings.site_wide_sale}
                    onCheckedChange={(checked) => setSalesSettings({...salesSettings, site_wide_sale: checked})}
                  />
                  <Label htmlFor="site-wide-sale" className="text-gray-300 cursor-pointer">
                    Enable Site-Wide Sale
                  </Label>
                </div>
                {salesSettings.site_wide_sale && (
                  <div>
                    <Label>Discount Percentage</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={salesSettings.site_wide_discount_percent}
                      onChange={(e) => setSalesSettings({...salesSettings, site_wide_discount_percent: parseFloat(e.target.value) || 0})}
                      className="bg-gray-800 border-gray-700 text-white mt-2"
                      placeholder="e.g., 20 for 20% off"
                    />
                  </div>
                )}
              </div>

              {/* Category Sales */}
              <div className="mb-8 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Category Sales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['T-Shirts', 'Sweaters', 'Hats', 'Stickers', 'Accessories'].map(category => (
                    <div key={category}>
                      <Label>{category} Discount %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={salesSettings.category_sales[category] || ''}
                        onChange={(e) => handleCategorySaleChange(category, e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white mt-2"
                        placeholder="0 = no discount"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Category sales override site-wide sales. Individual item sale prices override everything.
                </p>
              </div>

              <Button
                onClick={handleUpdateSalesSettings}
                className="drift-button px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500"
                style={{ fontFamily: 'Bebas Neue, sans-serif' }}
              >
                SAVE SALES SETTINGS
              </Button>
            </div>

            {/* Current Sales Summary */}
            <div className="drift-card p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Active Sales</h3>
              <div className="space-y-2">
                {salesSettings.site_wide_sale && (
                  <div className="p-3 bg-blue-900/30 rounded">
                    <p className="text-blue-400 font-bold">Site-Wide: {salesSettings.site_wide_discount_percent}% OFF</p>
                  </div>
                )}
                {Object.entries(salesSettings.category_sales || {}).map(([category, discount]) => (
                  <div key={category} className="p-3 bg-green-900/30 rounded">
                    <p className="text-green-400 font-bold">{category}: {discount}% OFF</p>
                  </div>
                ))}
                {!salesSettings.site_wide_sale && Object.keys(salesSettings.category_sales || {}).length === 0 && (
                  <p className="text-gray-400">No active sales</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="drift-card p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Add New Event</h2>
              <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    data-testid="event-name-input"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    data-testid="event-date-input"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="e.g. Dec 25, 2025"
                    required
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    data-testid="event-location-input"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label>Ticket Price (CAD)</Label>
                  <Input
                    data-testid="event-price-input"
                    type="number"
                    step="0.01"
                    value={newEvent.ticket_price}
                    onChange={(e) => setNewEvent({...newEvent, ticket_price: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Event Image</Label>
                  <Input
                    data-testid="event-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleEventImageChange}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                  {eventImagePreview && (
                    <div className="mt-3">
                      <img src={eventImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded border-2 border-gray-700" />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    data-testid="event-description-input"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Button 
                    data-testid="add-event-btn"
                    type="submit" 
                    className="drift-button px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500"
                    style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                  >
                    ADD EVENT
                  </Button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Current Events</h2>
              {events.map(event => (
                <div key={event.id} className="drift-card p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">{event.name}</h3>
                    <p className="text-gray-400">{event.date} - {event.location} - ${event.ticket_price} CAD</p>
                  </div>
                  <Button
                    data-testid={`delete-event-${event.id}-btn`}
                    onClick={() => handleDeleteEvent(event.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>



          {/* Parts Tab */}
          <TabsContent value="parts" className="space-y-6">
            <div className="drift-card p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Add New Part</h2>
              <form onSubmit={handleAddPart} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Part Name</Label>
                  <Input
                    data-testid="part-name-input"
                    value={newPart.name}
                    onChange={(e) => setNewPart({...newPart, name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label>Price (CAD)</Label>
                  <Input
                    data-testid="part-price-input"
                    type="number"
                    step="0.01"
                    value={newPart.price}
                    onChange={(e) => setNewPart({...newPart, price: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label>Car Model</Label>
                  <Input
                    data-testid="part-model-input"
                    value={newPart.car_model}
                    onChange={(e) => setNewPart({...newPart, car_model: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="e.g. Nissan 240SX"
                    required
                  />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input
                    data-testid="part-year-input"
                    value={newPart.year}
                    onChange={(e) => setNewPart({...newPart, year: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="e.g. 1995-1998"
                    required
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    data-testid="part-category-input"
                    value={newPart.category}
                    onChange={(e) => setNewPart({...newPart, category: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded"
                    required
                  >
                    <option value="Engine">Engine</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Drivetrain">Drivetrain</option>
                    <option value="Exterior">Exterior</option>
                    <option value="Interior">Interior</option>
                    <option value="Brakes">Brakes</option>
                    <option value="Wheels">Wheels</option>
                    <option value="Exhaust">Exhaust</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label>Condition</Label>
                  <select
                    data-testid="part-condition-input"
                    value={newPart.condition}
                    onChange={(e) => setNewPart({...newPart, condition: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded"
                    required
                  >
                    <option value="new">New</option>
                    <option value="used-excellent">Used - Excellent</option>
                    <option value="used-good">Used - Good</option>
                    <option value="used-fair">Used - Fair</option>
                  </select>
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input
                    data-testid="part-stock-input"
                    type="number"
                    value={newPart.stock}
                    onChange={(e) => setNewPart({...newPart, stock: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Part Image</Label>
                  <Input
                    data-testid="part-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePartImageChange}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                  {partImagePreview && (
                    <div className="mt-3">
                      <img src={partImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded border-2 border-gray-700" />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    data-testid="part-description-input"
                    value={newPart.description}
                    onChange={(e) => setNewPart({...newPart, description: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Button 
                    data-testid="add-part-btn"
                    type="submit" 
                    className="drift-button px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500"
                    style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                  >
                    ADD PART
                  </Button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Current Parts</h2>
              {parts.map(part => (
                <div key={part.id} className="drift-card p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">{part.name}</h3>
                    <p className="text-gray-400">${part.price} CAD - {part.category} - {part.car_model} ({part.year}) - {part.condition} - Stock: {part.stock}</p>
                  </div>
                  <Button
                    data-testid={`delete-part-${part.id}-btn`}
                    onClick={() => handleDeletePart(part.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers" className="space-y-6">
            <div className="drift-card p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Add New Driver</h2>
              <form onSubmit={handleAddDriver} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({...newDriver, name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label>Email (@triplebarrelracing.ca)</Label>
                  <Input
                    type="email"
                    value={newDriver.email}
                    onChange={(e) => setNewDriver({...newDriver, email: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="alexw@triplebarrelracing.ca"
                    required
                  />
                </div>
                <div>
                  <Label>Car Name (Optional)</Label>
                  <Input
                    value={newDriver.car_name}
                    onChange={(e) => setNewDriver({...newDriver, car_name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Driver Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleDriverImageChange}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                  {driverImagePreview && (
                    <div className="mt-3">
                      <img src={driverImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded border-2 border-gray-700" />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={newDriver.bio}
                    onChange={(e) => setNewDriver({...newDriver, bio: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    rows={4}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Button 
                    type="submit" 
                    disabled={uploadingImage}
                    className="drift-button px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500"
                    style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                  >
                    {uploadingImage ? 'UPLOADING...' : 'ADD DRIVER'}
                  </Button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Current Drivers</h2>
              {drivers.map(driver => (
                <div key={driver.id} className="drift-card p-4 rounded-lg flex gap-4">
                  <img src={getImageUrl(driver.image_url)} alt={driver.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{driver.name}</h3>
                    <p className="text-gray-400 text-sm">{driver.email}</p>
                    {driver.car_name && <p className="text-blue-400 text-sm">Drives: {driver.car_name}</p>}
                  </div>
                  <Button
                    onClick={() => handleDeleteDriver(driver.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Cars Tab */}
          <TabsContent value="cars" className="space-y-6">
            <div className="drift-card p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Add New Car</h2>
              <form onSubmit={handleAddCar} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Car Name</Label>
                  <Input
                    value={newCar.name}
                    onChange={(e) => setNewCar({...newCar, name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="The Beast"
                    required
                  />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input
                    value={newCar.year}
                    onChange={(e) => setNewCar({...newCar, year: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="2015"
                    required
                  />
                </div>
                <div>
                  <Label>Make</Label>
                  <Input
                    value={newCar.make}
                    onChange={(e) => setNewCar({...newCar, make: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Nissan"
                    required
                  />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input
                    value={newCar.model}
                    onChange={(e) => setNewCar({...newCar, model: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="240SX"
                    required
                  />
                </div>
                <div>
                  <Label>Driver Name (Optional)</Label>
                  <Input
                    value={newCar.driver_name}
                    onChange={(e) => setNewCar({...newCar, driver_name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Car Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleCarImageChange}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                  {carImagePreview && (
                    <div className="mt-3">
                      <img src={carImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded border-2 border-gray-700" />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label>Specs</Label>
                  <Textarea
                    value={newCar.specs}
                    onChange={(e) => setNewCar({...newCar, specs: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    rows={4}
                    placeholder="SR20DET swap, GT3076R turbo, 450HP..."
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Button 
                    type="submit" 
                    disabled={uploadingImage}
                    className="drift-button px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500"
                    style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                  >
                    {uploadingImage ? 'UPLOADING...' : 'ADD CAR'}
                  </Button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Current Cars</h2>
              {cars.map(car => (
                <div key={car.id} className="drift-card p-4 rounded-lg flex gap-4">
                  <img src={getImageUrl(car.image_url)} alt={car.name} className="w-24 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{car.name}</h3>
                    <p className="text-blue-400">{car.year} {car.make} {car.model}</p>
                    {car.driver_name && <p className="text-gray-400 text-sm">Driver: {car.driver_name}</p>}
                  </div>
                  <Button
                    onClick={() => handleDeleteCar(car.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog" className="space-y-6">
            <div className="drift-card p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Create New Blog Post</h2>
              <form onSubmit={handleAddBlogPost} className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newBlogPost.title}
                    onChange={(e) => setNewBlogPost({...newBlogPost, title: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    value={newBlogPost.category}
                    onChange={(e) => setNewBlogPost({...newBlogPost, category: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded"
                    required
                  >
                    <option value="events">Events</option>
                    <option value="new merch">New Merch</option>
                    <option value="new sponsors">New Sponsors</option>
                    <option value="announcements">Announcements</option>
                    <option value="team updates">Team Updates</option>
                  </select>
                </div>
                <div>
                  <Label>Author</Label>
                  <Input
                    value={newBlogPost.author}
                    onChange={(e) => setNewBlogPost({...newBlogPost, author: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label>Images (Multiple)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleBlogImagesChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  {blogImagePreviews.length > 0 && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {blogImagePreviews.map((preview, idx) => (
                        <img key={idx} src={preview} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover rounded border-2 border-gray-700" />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Content (Markdown Supported)</Label>
                  <Textarea
                    value={newBlogPost.content}
                    onChange={(e) => setNewBlogPost({...newBlogPost, content: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white font-mono"
                    rows={12}
                    placeholder="# Heading&#10;&#10;This is a **bold** text.&#10;&#10;- List item 1&#10;- List item 2"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Supports Markdown: **bold**, *italic*, # headings, - lists, [links](url), etc.
                  </p>
                </div>
                <div>
                  <Button 
                    type="submit" 
                    disabled={uploadingImage}
                    className="drift-button px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500"
                    style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                  >
                    {uploadingImage ? 'PUBLISHING...' : 'PUBLISH POST'}
                  </Button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Published Posts</h2>
              {blogPosts.map(post => (
                <div key={post.id} className="drift-card p-4 rounded-lg flex gap-4">
                  {post.images && post.images.length > 0 && (
                    <img src={getImageUrl(post.images[0])} alt={post.title} className="w-24 h-24 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs rounded mb-2">{post.category}</span>
                    <h3 className="text-xl font-bold">{post.title}</h3>
                    <p className="text-gray-400 text-sm">By {post.author}</p>
                  </div>
                  <Button
                    onClick={() => handleDeleteBlogPost(post.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Sponsors Tab */}
          <TabsContent value="sponsors" className="space-y-6">
            <div className="drift-card p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Add New Sponsor</h2>
              <form onSubmit={handleAddSponsor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Sponsor Name</Label>
                  <Input
                    value={newSponsor.name}
                    onChange={(e) => setNewSponsor({...newSponsor, name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label>Website URL (Optional)</Label>
                  <Input
                    type="url"
                    value={newSponsor.website_url}
                    onChange={(e) => setNewSponsor({...newSponsor, website_url: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label>Instagram URL (Optional)</Label>
                  <Input
                    type="url"
                    value={newSponsor.instagram_url}
                    onChange={(e) => setNewSponsor({...newSponsor, instagram_url: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <Label>Facebook URL (Optional)</Label>
                  <Input
                    type="url"
                    value={newSponsor.facebook_url}
                    onChange={(e) => setNewSponsor({...newSponsor, facebook_url: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Sponsor Logo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleSponsorImageChange}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                  {sponsorImagePreview && (
                    <div className="mt-3">
                      <img src={sponsorImagePreview} alt="Preview" className="w-32 h-32 object-contain rounded border-2 border-gray-700 bg-white p-2" />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={newSponsor.description}
                    onChange={(e) => setNewSponsor({...newSponsor, description: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button 
                    type="submit" 
                    disabled={uploadingImage}
                    className="drift-button px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500"
                    style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                  >
                    {uploadingImage ? 'UPLOADING...' : 'ADD SPONSOR'}
                  </Button>
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Current Sponsors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sponsors.map(sponsor => (
                  <div key={sponsor.id} className="drift-card p-4 rounded-lg">
                    <img src={getImageUrl(sponsor.logo_url)} alt={sponsor.name} className="w-full h-24 object-contain mb-3 bg-white p-2 rounded" />
                    <h3 className="text-lg font-bold mb-2">{sponsor.name}</h3>
                    {sponsor.description && <p className="text-gray-400 text-sm mb-3">{sponsor.description}</p>}
                    <div className="flex gap-2 mb-3">
                      {sponsor.website_url && (
                        <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline">
                          Website
                        </a>
                      )}
                      {sponsor.instagram_url && (
                        <a href={sponsor.instagram_url} target="_blank" rel="noopener noreferrer" className="text-pink-400 text-xs hover:underline">
                          Instagram
                        </a>
                      )}
                      {sponsor.facebook_url && (
                        <a href={sponsor.facebook_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline">
                          Facebook
                        </a>
                      )}
                    </div>
                    <Button
                      onClick={() => handleDeleteSponsor(sponsor.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>


          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Order Management</h2>
            <p className="text-gray-400 mb-6">Track and manage merchandise and parts orders</p>
            
            {inquiries.filter(i => i.inquiry_type === 'order' || i.inquiry_type === 'parts').length === 0 ? (
              <p className="text-gray-500">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {inquiries
                  .filter(i => i.inquiry_type === 'order' || i.inquiry_type === 'parts')
                  .map(order => (
                    <div key={order.id} className="drift-card p-6 rounded-lg" data-testid={`order-${order.id}`}>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Order Info */}
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <span className={`px-3 py-1 rounded text-sm font-bold ${
                              order.inquiry_type === 'order' ? 'bg-green-600' : 'bg-purple-600'
                            }`}>
                              {order.inquiry_type.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-400">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-bold mb-2">{order.name}</h3>
                          <p className="text-sm text-gray-400 mb-1">{order.email}</p>
                          <p className="text-sm text-gray-400 mb-3">{order.phone}</p>
                          
                          {order.item_details && (() => {
                            try {
                              const details = JSON.parse(order.item_details);
                              return (
                                <div className="bg-blue-600/20 p-4 rounded border border-blue-500 mb-3">
                                  <p className="text-sm font-bold text-white mb-2">Order Details:</p>
                                  <div className="text-sm text-gray-200 space-y-1">
                                    <p><strong>Item:</strong> {details.name}</p>
                                    <p><strong>Price:</strong> ${details.price} CAD</p>
                                    {details.selectedSize && <p><strong>Size:</strong> {details.selectedSize}</p>}
                                    {details.car_model && <p><strong>Model:</strong> {details.car_model}</p>}
                                    {details.year && <p><strong>Year:</strong> {details.year}</p>}
                                    {details.condition && <p><strong>Condition:</strong> {details.condition.replace('-', ' ').toUpperCase()}</p>}
                                  </div>
                                </div>
                              );
                            } catch {
                              return (
                                <div className="bg-blue-600/20 p-3 rounded border border-blue-500 mb-3">
                                  <p className="text-sm text-gray-300">
                                    <strong>Order Details:</strong><br/>
                                    {order.item_details}
                                  </p>
                                </div>
                              );
                            }
                          })()}
                          
                          <div className="bg-gray-800 p-3 rounded">
                            <p className="text-sm text-gray-300"><strong>Message:</strong></p>
                            <p className="text-sm text-gray-400 mt-1">{order.message}</p>
                          </div>
                        </div>
                        
                        {/* Order Status Management */}
                        <div className="space-y-4">
                          <div>
                            <Label className="text-gray-300 mb-2 block">Order Status</Label>
                            <select
                              value={order.status || 'pending'}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                              className={`w-full px-4 py-3 rounded text-sm font-bold cursor-pointer ${
                                order.status === 'completed' ? 'bg-green-600' :
                                order.status === 'shipped' ? 'bg-blue-600' :
                                order.status === 'processing' ? 'bg-yellow-600' :
                                order.status === 'contacted' ? 'bg-cyan-600' :
                                order.status === 'cancelled' ? 'bg-red-600' :
                                'bg-gray-600'
                              }`}
                              data-testid={`order-status-${order.id}`}
                            >
                              <option value="pending">PENDING</option>
                              <option value="contacted">CONTACTED</option>
                              <option value="processing">PROCESSING</option>
                              <option value="shipped">SHIPPED</option>
                              <option value="completed">COMPLETED</option>
                              <option value="cancelled">CANCELLED</option>
                            </select>
                          </div>
                          
                          {/* Status Guide */}
                          <div className="bg-gray-800 p-4 rounded text-xs space-y-2">
                            <p className="font-bold text-white mb-2">Status Guide:</p>
                            <p><span className="text-gray-400">PENDING:</span> Order received, awaiting review</p>
                            <p><span className="text-cyan-400">CONTACTED:</span> Customer contacted about order</p>
                            <p><span className="text-yellow-400">PROCESSING:</span> Order being prepared</p>
                            <p><span className="text-blue-400">SHIPPED:</span> Order shipped to customer</p>
                            <p><span className="text-green-400">COMPLETED:</span> Order delivered/picked up</p>
                            <p><span className="text-red-400">CANCELLED:</span> Order cancelled</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries" className="space-y-4">
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>Contact Inquiries & Orders</h2>
            {inquiries.length === 0 ? (
              <p className="text-gray-500">No inquiries yet</p>
            ) : (
              inquiries.map(inquiry => (
                <div key={inquiry.id} className="drift-card p-6 rounded-lg" data-testid={`inquiry-${inquiry.id}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{inquiry.name}</h3>
                      <p className="text-gray-400">{inquiry.email} · {inquiry.phone}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className={`px-3 py-1 rounded text-sm font-bold ${
                        inquiry.inquiry_type === 'order' ? 'bg-green-600' : 
                        inquiry.inquiry_type === 'ticket' ? 'bg-purple-600' : 'bg-blue-600'
                      }`}>
                        {inquiry.inquiry_type.toUpperCase()}
                      </span>
                      <select
                        value={inquiry.status || 'pending'}
                        onChange={(e) => handleStatusUpdate(inquiry.id, e.target.value)}
                        className={`px-3 py-1 rounded text-sm font-bold cursor-pointer ${
                          inquiry.status === 'completed' ? 'bg-green-600' :
                          inquiry.status === 'contacted' ? 'bg-yellow-600' :
                          inquiry.status === 'cancelled' ? 'bg-red-600' :
                          'bg-gray-600'
                        }`}
                        data-testid={`status-${inquiry.id}`}
                      >
                        <option value="pending">PENDING</option>
                        <option value="contacted">CONTACTED</option>
                        <option value="completed">COMPLETED</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>
                    </div>
                  </div>
                  {inquiry.event_name && (
                    <p className="text-sm text-gray-400 mb-2">Event: {inquiry.event_name}</p>
                  )}
                  {inquiry.item_details && (() => {
                    try {
                      const details = JSON.parse(inquiry.item_details);
                      return (
                        <div className="bg-blue-600/20 p-4 rounded border border-blue-500 mb-3">
                          <p className="text-sm font-bold text-white mb-2">Order Details:</p>
                          <div className="text-sm text-gray-200 space-y-1">
                            <p><strong>Item:</strong> {details.name}</p>
                            <p><strong>Price:</strong> ${details.price} CAD</p>
                            {details.selectedSize && <p><strong>Size:</strong> {details.selectedSize}</p>}
                            {details.car_model && <p><strong>Model:</strong> {details.car_model}</p>}
                            {details.year && <p><strong>Year:</strong> {details.year}</p>}
                            {details.condition && <p><strong>Condition:</strong> {details.condition.replace('-', ' ').toUpperCase()}</p>}
                          </div>
                        </div>
                      );
                    } catch {
                      return (
                        <div className="bg-blue-600/20 p-3 rounded border border-blue-500 mb-3">
                          <p className="text-sm text-gray-300">
                            <strong>Order Details:</strong> {inquiry.item_details}
                          </p>
                        </div>
                      );
                    }
                  })()}
                  <p className="text-gray-300">{inquiry.message}</p>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
