import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ContactModal from "@/components/ContactModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketInquiry = (event) => {
    setSelectedEvent(event);
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
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-6xl sm:text-7xl font-bold neon-glow mb-4"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            data-testid="events-title"
          >
            DRIFT EVENTS
          </h1>
          <p className="text-xl text-gray-400">Experience the Ultimate Adrenaline Rush</p>
        </div>

        {/* Events List - One per row */}
        {events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">No upcoming events yet. Stay tuned!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {events.map(event => (
              <div key={event.id} className="drift-card rounded-lg overflow-hidden" data-testid={`event-${event.id}`}>
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image Section */}
                  <div className="aspect-video md:aspect-square bg-gray-800 relative overflow-hidden">
                    <img 
                      src={event.image_url} 
                      alt={event.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-blue-600 px-4 py-2 font-bold rounded-none border-2 border-white">
                      <span style={{ fontFamily: 'Bebas Neue, sans-serif' }}>${event.ticket_price}</span>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                        {event.name}
                      </h3>
                      <div className="space-y-2 mb-4 text-gray-400">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <p className="text-gray-400 mb-6">{event.description}</p>
                    </div>
                    <Button
                      data-testid={`get-tickets-${event.id}-btn`}
                      onClick={() => handleTicketInquiry(event)}
                      className="drift-button w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-none border-2 border-blue-500"
                      style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                    >
                      GET TICKETS
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
          setSelectedEvent(null);
        }}
        inquiryType="ticket"
        eventId={selectedEvent?.id}
        eventName={selectedEvent?.name}
      />
    </div>
  );
}
