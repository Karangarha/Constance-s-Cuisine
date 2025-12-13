# Constance's Cuisine 🍽️

A modern, full-stack restaurant application built with React, TypeScript, and Supabase. This application features a seamless ordering experience for customers and a robust dashboard for administrators.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-2.0-blue.svg)

## ✨ Features

### 🛒 Customer Experience

- **Interactive Menu**: Browse categories (Appetizers, Mains, Desserts) with rich visuals.
- **Smart Cart**: Persistent shopping cart that survives page refreshes and tab closures.
- **Real-Time Tracking**: Watch order status update live from "Preparing" to "Delivered".
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices.
- **Secure Checkout**: Support for Delivery/Pickup and multiple payment methods (Cash, Zelle, PayPal).

### 👨‍🍳 Admin Dashboard

- **Secure Authentication**: Protected admin routes with persistent login sessions.
- **Order Management**: View, filter, and update order statuses in real-time.
- **Dynamic Settings**: Manage store payment IDs (Zelle/PayPal) directly from the UI.
- **Analytics**: (Coming Soon) Insights into sales and popular items.

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Auth**: [Supabase](https://supabase.com/)
- **State Management**: React Context API + LocalStorage
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Karangarha/Constance-s-Cuisine.git
   cd Constance-s-Cuisine
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/     # Reusable UI components (Navbar, Orders, etc.)
├── context/        # Global state (AuthContext, CartContext)
├── lib/            # Utilities & Supabase client configuration
├── logic/          # Business logic helpers
├── pages/          # Main application pages (Home, Menu, Admin, etc.)
├── ui/             # Generic UI elements (Toasts, Buttons)
└── App.tsx         # Main application entry point
```

## 🔐 Admin Access

To access the admin panel:

1. Navigate to `/login`.
2. Enter admin credentials (configured in your Supabase Auth).
3. Once logged in, you will be redirected to `/admin`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
