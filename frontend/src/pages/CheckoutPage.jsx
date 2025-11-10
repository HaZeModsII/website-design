import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PaymentForm, CreditCard } from "react-square-web-payments-sdk";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { item, selectedSize } = location.state || {};

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            NO ITEM SELECTED
          </h1>
          <p className="text-gray-400 mb-6">Please select an item from the store first.</p>
          <Button
            onClick={() => navigate('/store')}
            className="drift-button px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            BACK TO STORE
          </Button>
        </div>
      </div>
    );
  }

  const handleCreateOrder = async () => {
    if (!customerName || !customerEmail) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        customer_name: customerName,
        customer_email: customerEmail,
        line_items: [
          {
            product_id: item.id,
            product_name: item.name,
            size: selectedSize || null,
            quantity: 1,
            unit_price: item.price
          }
        ]
      };

      const response = await axios.post(`${API}/orders`, orderData);
      setOrderId(response.data.id);
      toast.success('Order created! Please complete payment.');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (token, verifiedBuyer) => {
    if (!orderId) return;

    setIsProcessing(true);
    try {
      const paymentData = {
        order_id: orderId,
        source_id: token.token
      };

      const response = await axios.post(`${API}/payments/process`, paymentData);

      if (response.data.success) {
        setPaymentDetails(response.data);
        setPaymentComplete(true);
        toast.success('Payment successful!');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.detail || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto drift-card p-8 rounded-lg text-center">
          <div className="mb-6">
            <svg className="w-20 h-20 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 
            className="text-4xl font-bold mb-4 neon-glow"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            PAYMENT SUCCESSFUL!
          </h1>
          
          <div className="space-y-3 text-gray-300 mb-8">
            <p><strong>Order ID:</strong> {paymentDetails.order_id}</p>
            <p><strong>Payment ID:</strong> {paymentDetails.payment_id}</p>
            <p><strong>Amount:</strong> ${paymentDetails.amount.toFixed(2)} CAD</p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => navigate('/store')}
              className="drift-button w-full px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              CONTINUE SHOPPING
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="drift-button w-full px-8 py-3 bg-transparent hover:bg-white/10 text-white font-bold rounded-none border-2 border-white"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              BACK TO HOME
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 
            className="text-5xl font-bold mb-8 neon-glow text-center"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            CHECKOUT
          </h1>

          <div className="drift-card p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              ORDER SUMMARY
            </h2>
            <div className="flex gap-4 mb-4">
              <img src={item.image_url} alt={item.name} className="w-24 h-24 object-cover rounded" />
              <div className="flex-1">
                <h3 className="text-xl font-bold">{item.name}</h3>
                {selectedSize && <p className="text-gray-400">Size: {selectedSize}</p>}
                <p className="text-gray-400">Quantity: 1</p>
                <p className="text-2xl font-bold text-blue-500 mt-2">${item.price.toFixed(2)} CAD</p>
              </div>
            </div>
          </div>

          <div className="drift-card p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              CUSTOMER INFORMATION
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Full Name</Label>
                <Input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-2 bg-gray-800 border-gray-700 text-white"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label className="text-gray-300">Email Address</Label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="mt-2 bg-gray-800 border-gray-700 text-white"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <Button
                onClick={handleCreateOrder}
                disabled={isProcessing || !customerName || !customerEmail}
                className="drift-button w-full px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500 disabled:opacity-50"
                style={{ fontFamily: 'Bebas Neue, sans-serif' }}
              >
                {isProcessing ? 'PROCESSING...' : 'CONTINUE TO PAYMENT'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if Square credentials are configured
  const squareAppId = process.env.REACT_APP_SQUARE_APPLICATION_ID;
  const squareLocationId = process.env.REACT_APP_SQUARE_LOCATION_ID;
  const isSquareConfigured = squareAppId && squareLocationId && 
    !squareAppId.includes('your_') && !squareLocationId.includes('your_');

  if (!isSquareConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 
            className="text-5xl font-bold mb-8 neon-glow text-center"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            PAYMENT SETUP REQUIRED
          </h1>

          <div className="drift-card p-8 rounded-lg text-center">
            <svg className="w-20 h-20 mx-auto mb-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            
            <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              SQUARE CREDENTIALS NOT CONFIGURED
            </h2>
            
            <p className="text-gray-300 mb-6">
              Please add your Square payment credentials to the environment variables to enable checkout.
            </p>

            <div className="bg-gray-800 p-4 rounded text-left mb-6">
              <p className="text-sm text-gray-400 mb-2">Add to <code className="text-blue-400">/app/frontend/.env</code>:</p>
              <pre className="text-xs text-green-400 overflow-x-auto">
{`REACT_APP_SQUARE_APPLICATION_ID=your_app_id
REACT_APP_SQUARE_LOCATION_ID=your_location_id`}
              </pre>
            </div>

            <div className="bg-gray-800 p-4 rounded text-left mb-6">
              <p className="text-sm text-gray-400 mb-2">Add to <code className="text-blue-400">/app/backend/.env</code>:</p>
              <pre className="text-xs text-green-400 overflow-x-auto">
{`SQUARE_ACCESS_TOKEN=your_access_token
SQUARE_APPLICATION_ID=your_app_id
SQUARE_LOCATION_ID=your_location_id`}
              </pre>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/store')}
                className="drift-button w-full px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-none border-2 border-blue-500"
                style={{ fontFamily: 'Bebas Neue, sans-serif' }}
              >
                BACK TO STORE
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 
          className="text-5xl font-bold mb-8 neon-glow text-center"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          COMPLETE PAYMENT
        </h1>

        <div className="drift-card p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            Order Total
          </h2>
          <p className="text-4xl font-bold text-blue-500">${item.price.toFixed(2)} CAD</p>
        </div>

        <div className="drift-card p-6 rounded-lg">
          <PaymentForm
            applicationId={squareAppId}
            locationId={squareLocationId}
            cardTokenizeResponseReceived={(token, buyer) => {
              handlePaymentSuccess(token, buyer);
            }}
          >
            <CreditCard />
          </PaymentForm>
        </div>
      </div>
    </div>
  );
}
