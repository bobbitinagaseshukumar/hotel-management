import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaTripadvisor } from 'react-icons/fa';

const footerLinks = {
  'Quick Links': [
    { name: 'Home', path: '/' },
    { name: 'Our Menu', path: '/menu' },
    { name: 'Today\'s Specials', path: '/specials' },
    { name: 'Special Offers', path: '/offers' },
    { name: 'Reservations', path: '/reservations' },
  ],
  'Guest Services': [
    { name: 'Room Booking', path: '/reservations' },
    { name: 'Table Reservation', path: '/reservations' },
    { name: 'Home Delivery', path: '/menu' },
    { name: 'Gift Cards', path: '/offers' },
    { name: 'Loyalty Program', path: '/profile' },
  ],
  'Information': [
    { name: 'About Us', path: '/about' },
    { name: 'Gallery', path: '/#gallery' },
    { name: 'Careers', path: '/careers' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms & Conditions', path: '/terms' },
    { name: 'Admin Portal', path: '/admin' },
  ],
};

const socialLinks = [
  { icon: FaFacebookF, url: '#', label: 'Facebook' },
  { icon: FaInstagram, url: '#', label: 'Instagram' },
  { icon: FaTwitter, url: '#', label: 'Twitter' },
  { icon: FaYoutube, url: '#', label: 'YouTube' },
  { icon: FaTripadvisor, url: '#', label: 'TripAdvisor' },
];

export default function Footer() {
  return (
    <footer className="relative bg-obsidian-950 border-t border-gold-500/10">
      {/* Gold Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-[0_0_20px_rgba(212,160,23,0.3)]">
                <span className="font-display text-obsidian-950 text-xl font-bold">G</span>
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-white">Grand Palatial</h3>
                <p className="text-[10px] text-gold-500 tracking-[0.35em] uppercase">Luxury Hotel & Restaurant</p>
              </div>
            </Link>

            <p className="text-platinum-400 text-sm leading-relaxed mb-6 max-w-sm">
              An iconic destination where world-class cuisine meets timeless luxury.
              Every detail is crafted to perfection for an unforgettable experience.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-platinum-400">
                <FiMapPin className="w-4 h-4 text-gold-500 flex-shrink-0" />
                <span>123 Royal Avenue, New Delhi, India 110001</span>
              </div>
              <div className="flex items-center gap-3 text-platinum-400">
                <FiPhone className="w-4 h-4 text-gold-500 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-platinum-400">
                <FiMail className="w-4 h-4 text-gold-500 flex-shrink-0" />
                <span>info@grandpalatial.com</span>
              </div>
              <div className="flex items-center gap-3 text-platinum-400">
                <FiClock className="w-4 h-4 text-gold-500 flex-shrink-0" />
                <span>Open Daily: 7:00 AM – 11:00 PM</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display text-lg font-semibold text-white mb-5 relative">
                {title}
                <span className="absolute -bottom-2 left-0 w-8 h-[2px] bg-gold-500" />
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-platinum-400 text-sm hover:text-gold-400 transition-colors duration-300 hover:pl-1"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-obsidian-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-platinum-500 text-xs">
            © {new Date().getFullYear()} The Grand Palatial. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-9 h-9 rounded-full border border-obsidian-700/50 flex items-center justify-center text-platinum-400 hover:text-gold-400 hover:border-gold-500/40 hover:bg-gold-500/10 transition-all duration-300"
              >
                <social.icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
