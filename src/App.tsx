import { useState } from "react";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import { BrowserRouter, Routes, Route } from "react-router";
import AdminPage from "./pages/AdminPage";
import { ToasterContainer } from "./ui/toaster";

type Page = "home" | "menu" | "cart";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToasterContainer/>
      <BrowserRouter>
        <Routes>
          <Route path="admin" element={<AdminPage />} />
          <Route
            path="/"
            element={
              <CartProvider>
                <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
                {currentPage === "home" && (
                  <HomePage onNavigate={handleNavigate} />
                )}
                {currentPage === "menu" && <MenuPage />}
                {currentPage === "cart" && (
                  <CartPage onNavigate={handleNavigate} />
                )}
              </CartProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
