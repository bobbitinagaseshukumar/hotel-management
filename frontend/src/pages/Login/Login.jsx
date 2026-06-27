import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiPhone, FiCompass } from 'react-icons/fi';

export default function Login() {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, register, sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please enter all credentials');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back to The Grand Palatial');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) return toast.error('Please fill in all details');
    setLoading(true);
    try {
      await register({ name, email, phone, password });
      toast.success('Registration successful. You can now login.');
      setIsLoginTab(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!email) return toast.error('Please enter your email first');
    setLoading(true);
    try {
      await sendOTP(email);
      setOtpSent(true);
      toast.success('OTP sent to your email. Please check inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the OTP received');
    setLoading(true);
    try {
      await verifyOTP(email, otp);
      toast.success('Verification successful');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Incorrect OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Access Experience | The Grand Palatial</title>
      </Helmet>

      <div className="min-h-screen relative flex items-center justify-center bg-obsidian-950 px-4 py-28 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-lg bg-obsidian-900/60 backdrop-blur-xl border border-gold-500/20 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
        >
          {/* Tabs */}
          <div className="flex border-b border-obsidian-800/80">
            <button
              onClick={() => { setIsLoginTab(true); setOtpSent(false); }}
              className={`flex-1 py-5 text-center font-display text-base tracking-wider transition-all border-b-2 cursor-pointer ${
                isLoginTab
                  ? 'text-gold-400 border-gold-500 bg-gold-500/5'
                  : 'text-platinum-400 border-transparent hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLoginTab(false)}
              className={`flex-1 py-5 text-center font-display text-base tracking-wider transition-all border-b-2 cursor-pointer ${
                !isLoginTab
                  ? 'text-gold-400 border-gold-500 bg-gold-500/5'
                  : 'text-platinum-400 border-transparent hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          <div className="p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-[0_0_20px_rgba(212,160,23,0.3)] mx-auto mb-3">
                <span className="font-display text-obsidian-950 text-xl font-bold">G</span>
              </div>
              <h2 className="font-display text-2xl text-white font-bold">The Grand Palatial</h2>
              <p className="text-gold-500/60 text-[10px] tracking-[0.3em] uppercase mt-1">Unlock Luxury Hospitality</p>
            </div>

            <AnimatePresence mode="wait">
              {isLoginTab ? (
                /* ─── LOGIN TAB ─── */
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {!otpSent ? (
                    /* Password Login Form */
                    <form onSubmit={handlePasswordLogin} className="space-y-5">
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="Your Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-obsidian-950 border border-obsidian-800 rounded-xl text-white placeholder:text-platinum-500 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
                          required
                        />
                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-platinum-400" />
                      </div>

                      <div className="relative">
                        <input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-obsidian-950 border border-obsidian-800 rounded-xl text-white placeholder:text-platinum-500 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
                          required
                        />
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-platinum-400" />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-gold-600 to-gold-500 text-obsidian-950 font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(212,160,23,0.4)] transition-all duration-300 flex items-center justify-center"
                      >
                        {loading ? <div className="w-5 h-5 border-2 border-t-obsidian-950 rounded-full animate-spin" /> : 'Access Account'}
                      </button>

                      <div className="relative flex items-center justify-center my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-obsidian-800" />
                        </div>
                        <span className="relative px-3 bg-obsidian-900 text-xs text-platinum-500 uppercase tracking-widest">or login via</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={loading}
                        className="w-full py-3.5 border border-gold-500/40 text-gold-400 font-semibold rounded-xl hover:bg-gold-500/10 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <FiCompass className="w-4 h-4" />
                        One-Time Password (OTP)
                      </button>
                    </form>
                  ) : (
                    /* OTP Verification Form */
                    <form onSubmit={handleVerifyOTP} className="space-y-5">
                      <p className="text-sm text-platinum-400 text-center mb-4">
                        We sent a verification code to <span className="text-white font-medium">{email}</span>
                      </p>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Enter 6-Digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                          className="w-full pl-11 pr-4 py-3.5 bg-obsidian-950 border border-obsidian-800 rounded-xl text-white placeholder:text-platinum-500 focus:outline-none focus:border-gold-500/50 transition-colors text-sm text-center tracking-[0.2em] font-semibold"
                          required
                        />
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-platinum-400" />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-gold-600 to-gold-500 text-obsidian-950 font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(212,160,23,0.4)] transition-all duration-300 flex items-center justify-center"
                      >
                        {loading ? <div className="w-5 h-5 border-2 border-t-obsidian-950 rounded-full animate-spin" /> : 'Verify & Continue'}
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-xs text-gold-400 hover:underline"
                        >
                          Back to Password Login
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              ) : (
                /* ─── REGISTER TAB ─── */
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleRegister} className="space-y-5">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-obsidian-950 border border-obsidian-800 rounded-xl text-white placeholder:text-platinum-500 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
                        required
                      />
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-platinum-400" />
                    </div>

                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-obsidian-950 border border-obsidian-800 rounded-xl text-white placeholder:text-platinum-500 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
                        required
                      />
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-platinum-400" />
                    </div>

                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-obsidian-950 border border-obsidian-800 rounded-xl text-white placeholder:text-platinum-500 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
                        required
                      />
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-platinum-400" />
                    </div>

                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-obsidian-950 border border-obsidian-800 rounded-xl text-white placeholder:text-platinum-500 focus:outline-none focus:border-gold-500/50 transition-colors text-sm"
                        required
                      />
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-platinum-400" />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-gold-600 to-gold-500 text-obsidian-950 font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(212,160,23,0.4)] transition-all duration-300 flex items-center justify-center"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-t-obsidian-950 rounded-full animate-spin" /> : 'Create Account'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}
