import { useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ContactModal({ open, onClose, inquiryType, eventId, eventName, prefilledMessage = '' }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: prefilledMessage
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${API}/contact`, {
        inquiry_type: inquiryType,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        event_id: eventId,
        event_name: eventName
      });

      toast.success('Inquiry submitted! We\'ll contact you soon.');
      setFormData({ name: '', email: '', phone: '', message: '' });
      onClose();
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-2 border-red-500 text-white max-w-md" data-testid="contact-modal">
        <DialogHeader>
          <DialogTitle 
            className="text-3xl font-bold text-red-500"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            {inquiryType === 'ticket' ? 'GET TICKETS' : 'CONTACT US'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {eventName && (
            <div className="bg-red-600/20 p-3 rounded border border-red-500">
              <p className="text-sm text-gray-300">Event: <span className="font-bold">{eventName}</span></p>
            </div>
          )}
          
          <div>
            <Label htmlFor="name" className="text-gray-300">Name</Label>
            <Input
              id="name"
              data-testid="contact-name-input"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="mt-2 bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              data-testid="contact-email-input"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="mt-2 bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="text-gray-300">Phone</Label>
            <Input
              id="phone"
              data-testid="contact-phone-input"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="mt-2 bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="message" className="text-gray-300">Message</Label>
            <Textarea
              id="message"
              data-testid="contact-message-input"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="mt-2 bg-gray-800 border-gray-700 text-white min-h-[100px]"
              required
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button
              data-testid="contact-submit-btn"
              type="submit"
              disabled={submitting}
              className="flex-1 drift-button py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-none border-2 border-red-500"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              {submitting ? 'SUBMITTING...' : 'SUBMIT'}
            </Button>
            <Button
              data-testid="contact-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-transparent hover:bg-gray-800 text-white font-bold rounded-none border-2 border-gray-600"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              CANCEL
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
