import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiUsers, FiAward, FiBookmark } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function Reservations() {
  const [resType, setResType] = useState('table'); // table or room
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('2');
  const [roomType, setRoomType] = useState('Executive Suite');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [myReservations, setMyReservations] = useState([]);

  useEffect(() => {
    fetchMyReservations();
  }, []);

  const fetchMyReservations = async () => {
    try {
      const res = await api.get('/api/reservations/user');
      if (res.data?.success) {
        setMyReservations(res.data.data);
      }
    } catch (err) {
      console.log('Error fetching user reservations');
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!date) return toast.error('Please select a date');

    setLoading(true);
    const payload = {
      reservation_type: resType,
      guest_count: parseInt(guests),
      check_in: resType === 'table' ? `${date}T${time || '19:00'}:00` : `${date}T14:00:00`,
      check_out: resType === 'room' ? `${date}T11:00:00` : null, // simplifed logic
      room_type: resType === 'room' ? roomType : null,
      table_number: resType === 'table' ? Math.floor(Math.random() * 15) + 1 : null,
      special_requests: specialRequests
    };

    try {
      const res = await api.post('/api/reservations', payload);
      if (res.data?.success) {
        toast.success(`${resType === 'table' ? 'Table reserved' : 'Room booked'} successfully!`);
        setDate('');
        setTime('');
        setSpecialRequests('');
        fetchMyReservations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reservations | The Grand Palatial</title>
      </Helmet>

      <div className="min-h-screen pt-28 pb-20 bg-obsidian-950 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-gold-500 font-accent text-sm tracking-[0.4em] uppercase">Reservations</span>
            <h1 className="font-display text-4xl font-bold text-white mt-2">
              Book Your <span className="text-gold-400">Experience</span>
            </h1>
            <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side Form */}
            <div className="lg:col-span-7 bg-obsidian-900/40 p-8 rounded-3xl border border-obsidian-850">
              <div className="flex bg-obsidian-950 p-1.5 rounded-full border border-obsidian-800 mb-6">
                <button
                  onClick={() => setResType('table')}
                  className={`flex-1 py-3 rounded-full text-sm font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                    resType === 'table' ? 'bg-gold-500 text-obsidian-950 shadow-md' : 'text-platinum-400 hover:text-white'
                  }`}
                >
                  Table Reservation
                </button>
                <button
                  onClick={() => setResType('room')}
                  className={`flex-1 py-3 rounded-full text-sm font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                    resType === 'room' ? 'bg-gold-500 text-obsidian-950 shadow-md' : 'text-platinum-400 hover:text-white'
                  }`}
                >
                  Room Booking
                </button>
              </div>

              <form onSubmit={handleBook} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-platinum-400 font-medium block mb-2">Select Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-obsidian-950 border border-obsidian-800 rounded-xl text-white text-sm focus:outline-none focus:border-gold-500/50"
                        required
                      />
                      <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-platinum-500" />
                    </div>
                  </div>

                  {resType === 'table' ? (
                    <div>
                      <label className="text-xs text-platinum-400 font-medium block mb-2">Select Time</label>
                      <div className="relative">
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-obsidian-950 border border-obsidian-800 rounded-xl text-white text-sm focus:outline-none focus:border-gold-500/50"
                          required
                        />
                        <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-platinum-500" />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs text-platinum-400 font-medium block mb-2">Room Class</label>
                      <select
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                        className="w-full px-4 py-3 bg-obsidian-950 border border-obsidian-800 rounded-xl text-white text-sm focus:outline-none focus:border-gold-500/50"
                      >
                        <option>Executive Suite</option>
                        <option>Presidential Villa</option>
                        <option>Royal Penthouse</option>
                        <option>Deluxe Garden View</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-platinum-400 font-medium block mb-2">
                      {resType === 'table' ? 'Number of Guests' : 'Number of Occupants'}
                    </label>
                    <div className="relative">
                      <select
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-obsidian-950 border border-obsidian-800 rounded-xl text-white text-sm focus:outline-none focus:border-gold-500/50"
                      >
                        <option value="1">1 Person</option>
                        <option value="2">2 People</option>
                        <option value="3">3 People</option>
                        <option value="4">4 People</option>
                        <option value="6">6 People</option>
                        <option value="8">8+ People</option>
                      </select>
                      <FiUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-platinum-500" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-platinum-400 font-medium block mb-2">Special Arrangements</label>
                    <input
                      type="text"
                      placeholder="e.g. Birthday, Anniversary"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full px-4 py-3 bg-obsidian-950 border border-obsidian-800 rounded-xl text-white text-sm focus:outline-none focus:border-gold-500/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-500 text-obsidian-950 font-bold rounded-xl hover:shadow-[0_0_30px_rgba(212,160,23,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-t-obsidian-950 rounded-full animate-spin" />
                  ) : (
                    <>Confirm Reservation Booking</>
                  )}
                </button>
              </form>
            </div>

            {/* Right side display list */}
            <div className="lg:col-span-5 bg-obsidian-900/40 p-8 rounded-3xl border border-obsidian-850 space-y-6">
              <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <FiBookmark className="text-gold-500" /> Current Bookings
              </h3>

              {myReservations.length === 0 ? (
                <div className="text-center py-8 text-platinum-500 text-sm border border-dashed border-obsidian-850 rounded-2xl">
                  You have no active bookings
                </div>
              ) : (
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                  {myReservations.map((res) => (
                    <div key={res.id} className="p-4 rounded-xl bg-obsidian-950 border border-obsidian-850 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          res.reservation_type === 'table' ? 'bg-gold-500/20 text-gold-400' : 'bg-blue-500/20 text-blue-450'
                        }`}>
                          {res.reservation_type === 'table' ? 'Table Dining' : 'Room'}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          res.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-450'
                        }`}>
                          {res.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {res.reservation_type === 'table' ? `Table Reservation (Table ${res.table_number})` : `${res.room_type}`}
                      </p>
                      <div className="flex gap-4 text-xs text-platinum-400">
                        <span className="flex items-center gap-1">
                          <FiCalendar className="w-3 h-3 text-gold-500" />
                          {new Date(res.check_in).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock className="w-3 h-3 text-gold-500" />
                          {new Date(res.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
