import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { FiCreditCard, FiMapPin, FiTruck, FiBox, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function Checkout() {
  const { cartItems, cartTotal, coupon, applyCoupon, removeCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState('table_order'); // table_order or home_delivery
  const [tableNumber, setTableNumber] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // razorpay or cod
  const [instructions, setInstructions] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Address Creation states
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [label, setLabel] = useState('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Tax and final calculation
  const gstAmount = Math.round(cartTotal * 0.18);
  const deliveryCharge = orderType === 'home_delivery' ? 150 : 0;
  const discountAmount = coupon ? Math.min((cartTotal * coupon.discount_percentage) / 100, coupon.max_discount || 1000) : 0;
  const finalAmount = cartTotal + gstAmount + deliveryCharge - discountAmount;

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/menu');
    }
    fetchAddresses();
  }, [cartItems]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/api/auth/addresses');
      if (res.data?.success) {
        setAddresses(res.data.data);
        if (res.data.data.length > 0) {
          const def = res.data.data.find(a => a.is_default) || res.data.data[0];
          setSelectedAddressId(def.id);
        }
      }
    } catch (err) {
      console.log('Error fetching addresses');
    }
  };

  const handleApplyCouponSubmit = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    try {
      const res = await api.post('/api/coupons/validate', { code: couponCode, orderAmount: cartTotal });
      if (res.data?.success) {
        applyCoupon(res.data.data);
        toast.success(`Coupon "${couponCode}" applied successfully!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !postalCode) {
      return toast.error('Please enter all address details');
    }
    try {
      const res = await api.post('/api/auth/addresses', { label, street, city, state, postal_code: postalCode });
      if (res.data?.success) {
        toast.success('Address saved successfully');
        fetchAddresses();
        setShowNewAddress(false);
        setStreet('');
        setCity('');
        setState('');
        setPostalCode('');
      }
    } catch (err) {
      toast.error('Failed to save address');
    }
  };

  // Razorpay Checkout flow
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (orderType === 'table_order' && !tableNumber) {
      return toast.error('Please enter your table number');
    }
    if (orderType === 'home_delivery' && !selectedAddressId) {
      return toast.error('Please select or add a delivery address');
    }

    setLoading(true);

    const orderPayload = {
      order_type: orderType,
      table_number: orderType === 'table_order' ? parseInt(tableNumber) : null,
      delivery_address_id: orderType === 'home_delivery' ? selectedAddressId : null,
      coupon_code: coupon?.code || null,
      payment_method: paymentMethod,
      special_instructions: instructions,
      items: cartItems.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.offer_price || item.price
      }))
    };

    try {
      if (paymentMethod === 'cod') {
        const res = await api.post('/api/orders', orderPayload);
        if (res.data?.success) {
          toast.success('Order placed successfully!');
          clearCart();
          navigate('/orders');
        }
      } else {
        // Razorpay Payment Flow
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          toast.error('Razorpay SDK failed to load. Are you offline?');
          setLoading(false);
          return;
        }

        // 1. Create order on backend to get razorpay_order_id
        const orderRes = await api.post('/api/payments/create-order', {
          amount: finalAmount
        });

        if (!orderRes.data?.success) {
          throw new Error('Failed to create Razorpay Order');
        }

        const rpOrder = orderRes.data.data;

        // 2. Open Razorpay Checkout Modal
        const options = {
          key: rpOrder.key_id || 'rzp_test_dummy',
          amount: rpOrder.amount,
          currency: 'INR',
          name: 'The Grand Palatial',
          description: 'Luxury Cuisine Order',
          order_id: rpOrder.id,
          handler: async function (response) {
            // Verify payment on backend
            try {
              const verifyPayload = {
                ...orderPayload,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              };
              const verifyRes = await api.post('/api/payments/verify', verifyPayload);
              if (verifyRes.data?.success) {
                toast.success('Payment verified & order placed!');
                clearCart();
                navigate('/orders');
              } else {
                toast.error('Payment verification failed.');
              }
            } catch (err) {
              toast.error('Error verifying payment.');
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone
          },
          theme: {
            color: '#D4A017'
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Secure Checkout | The Grand Palatial</title>
      </Helmet>

      <div className="min-h-screen pt-28 pb-20 bg-obsidian-950 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="font-display text-3xl font-bold mb-8 text-center md:text-left">
            Confirm <span className="text-gold-400">Order</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Options (2 Columns) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Type Choice */}
              <div className="p-6 rounded-2xl bg-obsidian-900/40 border border-obsidian-850">
                <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <FiBox className="text-gold-500" /> Dining Preference
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setOrderType('table_order')}
                    className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                      orderType === 'table_order'
                        ? 'border-gold-500 bg-gold-500/5 text-gold-400'
                        : 'border-obsidian-800 bg-obsidian-950/40 text-platinum-400 hover:border-platinum-700'
                    }`}
                  >
                    <FiCheckCircle className="w-6 h-6" />
                    <span className="font-semibold text-sm">Table Dining</span>
                  </button>

                  <button
                    onClick={() => setOrderType('home_delivery')}
                    className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                      orderType === 'home_delivery'
                        ? 'border-gold-500 bg-gold-500/5 text-gold-400'
                        : 'border-obsidian-800 bg-obsidian-950/40 text-platinum-400 hover:border-platinum-700'
                    }`}
                  >
                    <FiTruck className="w-6 h-6" />
                    <span className="font-semibold text-sm">Home Delivery</span>
                  </button>
                </div>

                {/* Table Number details */}
                {orderType === 'table_order' && (
                  <div className="mt-5">
                    <label className="text-xs text-platinum-400 font-medium block mb-2">Table Number</label>
                    <input
                      type="number"
                      placeholder="Enter your table number (e.g. 5)"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="max-w-xs w-full px-4 py-3 bg-obsidian-950 border border-obsidian-800 rounded-xl text-white focus:outline-none focus:border-gold-500/50 text-sm"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Delivery Address selection */}
              {orderType === 'home_delivery' && (
                <div className="p-6 rounded-2xl bg-obsidian-900/40 border border-obsidian-850">
                  <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                    <FiMapPin className="text-gold-500" /> Delivery Address
                  </h3>

                  {/* Saved addresses selector */}
                  {addresses.length > 0 && !showNewAddress && (
                    <div className="space-y-3 mb-4">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedAddressId === addr.id
                              ? 'border-gold-500 bg-gold-500/5'
                              : 'border-obsidian-800 bg-obsidian-950/30'
                          }`}
                        >
                          <input
                            type="radio"
                            name="delivery_address"
                            value={addr.id}
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 accent-gold-500"
                          />
                          <div>
                            <span className="text-xs font-bold text-gold-400 uppercase">{addr.label}</span>
                            <p className="text-white text-sm font-medium mt-1">{addr.street}</p>
                            <p className="text-platinum-400 text-xs">{addr.city}, {addr.state} - {addr.postal_code}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Show add new address form */}
                  {showNewAddress ? (
                    <form onSubmit={handleAddAddress} className="space-y-4 bg-obsidian-950/60 p-5 rounded-xl border border-obsidian-800 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Label (e.g. Home)"
                          value={label}
                          onChange={(e) => setLabel(e.target.value)}
                          className="px-4 py-2.5 bg-obsidian-900 border border-obsidian-800 rounded-xl text-sm"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Postal Code"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="px-4 py-2.5 bg-obsidian-900 border border-obsidian-800 rounded-xl text-sm"
                          required
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full px-4 py-2.5 bg-obsidian-900 border border-obsidian-800 rounded-xl text-sm"
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="City"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="px-4 py-2.5 bg-obsidian-900 border border-obsidian-800 rounded-xl text-sm"
                          required
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="px-4 py-2.5 bg-obsidian-900 border border-obsidian-800 rounded-xl text-sm"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 bg-gold-500 text-obsidian-950 text-xs font-bold rounded-full">
                          Save Address
                        </button>
                        <button type="button" onClick={() => setShowNewAddress(false)} className="px-4 py-2 border border-obsidian-700 text-xs text-platinum-400 rounded-full">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowNewAddress(true)}
                      className="text-gold-400 hover:text-gold-300 text-sm font-semibold flex items-center gap-1.5"
                    >
                      + Add Delivery Address
                    </button>
                  )}
                </div>
              )}

              {/* Payment Methods */}
              <div className="p-6 rounded-2xl bg-obsidian-900/40 border border-obsidian-850">
                <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <FiCreditCard className="text-gold-500" /> Payment Method
                </h3>
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'razorpay' ? 'border-gold-500 bg-gold-500/5' : 'border-obsidian-800 bg-obsidian-950/30'
                  }`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="accent-gold-500"
                    />
                    <div>
                      <p className="text-white text-sm font-semibold">Razorpay Online Payment</p>
                      <p className="text-platinum-500 text-xs">Credit/Debit Cards, UPI, Netbanking, Wallets</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod' ? 'border-gold-500 bg-gold-500/5' : 'border-obsidian-800 bg-obsidian-950/30'
                  }`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-gold-500"
                    />
                    <div>
                      <p className="text-white text-sm font-semibold">
                        {orderType === 'table_order' ? 'Pay at Table / Cash' : 'Cash on Delivery (COD)'}
                      </p>
                      <p className="text-platinum-500 text-xs">Pay after meal service completion</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="text-xs text-platinum-400 font-medium block mb-2">Chef Instructions (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Extra spicy, no mushrooms, allergens info..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-4 py-3 bg-obsidian-900/40 border border-obsidian-850 rounded-xl text-white placeholder:text-platinum-500 focus:outline-none focus:border-gold-500/50 text-sm resize-none"
                />
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-1">
              <div className="p-6 rounded-2xl bg-obsidian-900/60 border border-gold-500/20 sticky top-28 space-y-6">
                <h3 className="font-display text-lg font-bold border-b border-obsidian-800/80 pb-3">Order Summary</h3>

                {/* Items list */}
                <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-platinum-300 truncate max-w-[150px]">
                        {item.name} <span className="text-gold-500 font-semibold font-mono">x{item.quantity}</span>
                      </span>
                      <span className="text-white font-medium">
                        ₹{Number((item.offer_price || item.price) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon Code input */}
                <form onSubmit={handleApplyCouponSubmit} className="pt-4 border-t border-obsidian-800/80">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 bg-obsidian-950 border border-obsidian-800 rounded-lg text-xs placeholder:text-platinum-600 focus:outline-none focus:border-gold-500/50"
                    />
                    <button type="submit" className="px-4 py-2 bg-gold-500 text-obsidian-950 text-xs font-semibold rounded-lg">
                      Apply
                    </button>
                  </div>
                  {coupon && (
                    <div className="flex justify-between items-center mt-2 bg-gold-500/10 p-2 rounded-lg border border-gold-500/20">
                      <span className="text-xs text-gold-400 font-semibold font-mono">CODE: {coupon.code}</span>
                      <button type="button" onClick={removeCoupon} className="text-red-400 text-[10px] hover:underline">
                        Remove
                      </button>
                    </div>
                  )}
                </form>

                {/* Bills calculation */}
                <div className="space-y-2.5 pt-4 border-t border-obsidian-800/80 text-sm">
                  <div className="flex justify-between text-platinum-400">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-platinum-400">
                    <span>GST (18%)</span>
                    <span>₹{gstAmount.toLocaleString()}</span>
                  </div>
                  {orderType === 'home_delivery' && (
                    <div className="flex justify-between text-platinum-400">
                      <span>Delivery Charge</span>
                      <span>₹{deliveryCharge.toLocaleString()}</span>
                    </div>
                  )}
                  {coupon && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount</span>
                      <span>-₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-display text-base font-bold text-white border-t border-obsidian-800/80 pt-3">
                    <span>Total Amount</span>
                    <span className="text-gold-400">₹{finalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-500 text-obsidian-950 font-bold rounded-xl hover:shadow-[0_0_30px_rgba(212,160,23,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-t-obsidian-950 rounded-full animate-spin" />
                  ) : (
                    <>
                      Place Order (₹{finalAmount.toLocaleString()})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
