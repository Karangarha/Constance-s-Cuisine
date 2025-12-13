import { useState } from "react";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import { BrowserRouter, Routes, Route } from "react-router";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import TrackingPage from "./pages/TrackingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ToasterContainer } from "./ui/toaster";
import FloatingCart from "./components/FloatingCart";

type Page = "home" | "menu" | "cart";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToasterContainer />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="admin" element={<AdminPage />} />
            </Route>

            <Route
              path="/"
              element={
                <CartProvider>
                  <Navbar
                    currentPage={currentPage}
                    onNavigate={handleNavigate}
                  />
                  <div key={currentPage} className="animate-fade-in-up">
                    {currentPage === "home" && (
                      <HomePage onNavigate={handleNavigate} />
                    )}
                    {currentPage === "menu" && <MenuPage />}
                    {currentPage === "cart" && (
                      <CartPage onNavigate={handleNavigate} />
                    )}
                  </div>
                  <FloatingCart onNavigate={handleNavigate} />
                </CartProvider>
              }
            />
            <Route path="/track/:orderId" element={<TrackingPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
