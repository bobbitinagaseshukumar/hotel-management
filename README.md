# 🏨 The Grand Palatial — Luxury 5-Star Hotel & Restaurant

A world-class, ultra-premium hotel and restaurant web application featuring immersive 3D animations, real-time order management, and a comprehensive admin dashboard.

![License](https://img.shields.io/badge/License-MIT-gold)
![Node](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)

---

## ✨ Features

### 🎨 Premium Frontend
- **Cinematic 3D Hero** — Full-screen Three.js hotel building with dynamic lighting and camera orbit
- **3D Food Showcase** — Rotating food models with hover interactions
- **Framer Motion Animations** — Smooth entrance, parallax, and micro-interaction animations
- **Glassmorphic UI** — Premium glass-effect navbar, cards, and modals
- **Dark Luxury Theme** — Obsidian, champagne gold, and platinum color palette
- **Fully Responsive** — Mobile, tablet, laptop, desktop, and large screens

### 🍽️ Customer Features
- Email OTP Authentication
- Browse & Search Menu
- Category Filtering (Starters, Main Course, Desserts, Beverages)
- Today's Specials & New Arrivals
- Add to Cart with Quantity Controls
- Table Order or Home Delivery
- Saved Delivery Addresses
- Razorpay Online Payment & Cash on Delivery
- Real-time Order Tracking
- Table & Room Reservations
- Customer Reviews & Ratings
- Loyalty Points & Coupon Codes
- Order History & Profile Management

### 🔧 Admin Dashboard
- Secure Admin Login (Role-Based Access)
- Add/Edit/Delete Menu Items with Image Upload
- Mark items as Special, New Arrival, or Offer
- View & Manage All Orders
- Update Order Status (Pending → Preparing → Ready → Delivered)
- Kitchen Dashboard with Live Orders
- Revenue Analytics (Daily/Weekly/Monthly)
- Top Selling Dishes
- Customer Growth Charts
- Coupon & Promotion Management
- Staff Management
- Audit Logs

### 🔒 Security
- JWT Authentication (Access + Refresh Tokens)
- bcrypt Password Hashing
- Rate Limiting
- Helmet Security Headers
- CORS Configuration
- Input Validation & Sanitization

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **3D Graphics** | Three.js, React Three Fiber, Drei |
| **Animations** | Framer Motion |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Authentication** | JWT, Nodemailer OTP |
| **Payments** | Razorpay |
| **Charts** | Recharts |
| **Icons** | React Icons |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 📁 Project Structure

```
hotel-management/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar/
│   │   │   ├── Footer/
│   │   │   ├── Hero3D/
│   │   │   ├── FoodCard/
│   │   │   ├── FoodShowcase/
│   │   │   ├── Cart/
│   │   │   ├── Loader/
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── Menu/
│   │   │   ├── Offers/
│   │   │   ├── Login/
│   │   │   ├── Profile/
│   │   │   ├── Checkout/
│   │   │   ├── Orders/
│   │   │   └── Admin/
│   │   ├── context/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd hotel-management
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL and Razorpay credentials
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in Browser
Navigate to `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/hotel_db
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
FRONTEND_URL=http://localhost:5173
```

---

## 🌐 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import project in Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables

### Backend (Render)
1. Push to GitHub
2. Create a new Web Service on Render
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variables

---

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for luxury hospitality.
