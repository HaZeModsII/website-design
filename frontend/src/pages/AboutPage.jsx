import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Instagram, Facebook, ExternalLink } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AboutPage() {
  const [drivers, setDrivers] = useState([]);
  const [cars, setCars] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Contact form state
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [driversRes, carsRes, sponsorsRes] = await Promise.all([
        axios.get(`${API}/drivers`),
        axios.get(`${API}/cars`),
        axios.get(`${API}/sponsors`)
      ]);
      setDrivers(driversRes.data);
      setCars(carsRes.data);
      setSponsors(sponsorsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedDriver) {
      toast.error('Please select a driver');
      return;
    }

    setSending(true);
    try {
      await axios.post(`${API}/drivers/contact`, {
        driver_id: selectedDriver.id,
        sender_name: senderName,
        sender_email: senderEmail,
        message: message
      });
      
      toast.success('Message sent successfully!');
      setSenderName('');
      setSenderEmail('');
      setMessage('');
      setSelectedDriver(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

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
          ABOUT US
        </h1>

        {/* Team Introduction */}
        <section className="mb-20">
          <div className="drift-card p-8 rounded-lg">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              WHO WE ARE
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Triple Barrel Racing is an underground drifting team dedicated to pushing the limits of automotive performance 
              and street racing culture. Founded on a passion for adrenaline and precision driving, we bring together some of 
              the most skilled drivers and meticulously built machines in the scene. From late-night practice sessions to 
              high-stakes competitions, we live and breathe the drift lifestyle.
            </p>
          </div>
        </section>

        {/* Drivers Section */}
        <section className="mb-20">
          <h2 className="text-5xl font-bold mb-8 text-center" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            MEET THE DRIVERS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {drivers.map(driver => (
              <div key={driver.id} className="drift-card rounded-lg overflow-hidden">
                <img 
                  src={driver.image_url} 
                  alt={driver.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    {driver.name}
                  </h3>
                  {driver.car_name && (
                    <p className="text-blue-400 text-sm mb-3">Drives: {driver.car_name}</p>
                  )}
                  <p className="text-gray-400 mb-4">{driver.bio}</p>
                  <Button
                    onClick={() => setSelectedDriver(driver)}
                    className="drift-button w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500"
                    style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                  >
                    <Mail className="mr-2" size={16} />
                    ASK ME A QUESTION
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Driver Modal */}
        {selectedDriver && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="drift-card p-8 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                ASK {selectedDriver.name.toUpperCase()} A QUESTION
              </h2>
              <p className="text-gray-400 mb-6">Send a message directly to {selectedDriver.name}'s inbox.</p>
              
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <Label className="text-gray-300">Your Name</Label>
                  <Input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="mt-2 bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Your Email</Label>
                  <Input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="mt-2 bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Your Message</Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-2 bg-gray-800 border-gray-700 text-white"
                    rows={5}
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={sending}
                    className="drift-button flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500"
                    style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                  >
                    {sending ? 'SENDING...' : 'SEND MESSAGE'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setSelectedDriver(null)}
                    className="drift-button px-6 py-3 bg-transparent hover:bg-white/10 text-white font-bold rounded-none border-2 border-white"
                    style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                  >
                    CANCEL
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cars Section */}
        <section className="mb-20">
          <h2 className="text-5xl font-bold mb-8 text-center" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            THE MACHINES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cars.map(car => (
              <div key={car.id} className="drift-card rounded-lg overflow-hidden">
                <img 
                  src={car.image_url} 
                  alt={car.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                    {car.name}
                  </h3>
                  <p className="text-blue-400 mb-2">{car.year} {car.make} {car.model}</p>
                  {car.driver_name && (
                    <p className="text-gray-400 mb-3">Driver: {car.driver_name}</p>
                  )}
                  <div className="bg-gray-800/50 p-4 rounded">
                    <p className="text-gray-300 text-sm whitespace-pre-line">{car.specs}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sponsors Section */}
        <section className="mb-20">
          <h2 className="text-5xl font-bold mb-8 text-center" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            PEOPLE WHO SUPPORT US
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sponsors.map(sponsor => (
              <div key={sponsor.id} className="drift-card p-6 rounded-lg flex flex-col items-center justify-center hover:scale-105 transition-transform">
                <img 
                  src={sponsor.logo_url} 
                  alt={sponsor.name}
                  className="w-full h-24 object-contain mb-4"
                />
                <h4 className="text-lg font-bold text-center mb-2">{sponsor.name}</h4>
                {sponsor.description && (
                  <p className="text-gray-400 text-xs text-center mb-3">{sponsor.description}</p>
                )}
                <div className="flex gap-3">
                  {sponsor.website_url && (
                    <a
                      href={sponsor.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                  {sponsor.instagram_url && (
                    <a
                      href={sponsor.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-pink-500 transition-colors"
                    >
                      <Instagram size={18} />
                    </a>
                  )}
                  {sponsor.facebook_url && (
                    <a
                      href={sponsor.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Facebook size={18} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          {sponsors.length === 0 && (
            <div className="text-center text-gray-400">
              <p>We're always looking for partners who share our passion for drift culture.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
