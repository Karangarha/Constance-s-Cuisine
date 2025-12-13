import { useState, useEffect } from "react";
import { ChefHat, Clock, Award } from "lucide-react";
import { supabase, MenuItem } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import Carousel from "../components/Carousel";

import backgroundImg from "../public/background.png";

interface HomePageProps {
  onNavigate: (page: "menu") => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [specialItems, setSpecialItems] = useState<MenuItem[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchSpecialItems();
  }, []);

  const fetchSpecialItems = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("special_item", true)
        .eq("available", true);

      if (error) throw error;
      setSpecialItems(data || []);
    } catch (error) {
      console.error("Error fetching special items:", error);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative h-[600px] flex items-center justify-center bg-gray-50 overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-70 blur-sm bg-cover bg-center brightness-50"
          style={{ backgroundImage: `url(${backgroundImg})` }}
        />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text text-white tracking-tight">
            Welcome to Constance's Cuisine
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-600 max-w-2xl mx-auto font-light text-white leading-relaxed">
            Experience culinary excellence with fresh, locally-sourced
            ingredients and authentic flavors or order online with ease.
          </p>
          <button
            onClick={() => onNavigate("menu")}
            className="bg-gradient-to-t from-brand-dark to-brand-light hover:opacity-90 text-white font-medium py-3 px-10 rounded-full text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            Explore Our Menu
          </button>
        </div>
      </section>

      {specialItems.length > 0 && (
        <section className="py-20 bg-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/3 text-left">
                <h2 className="text-4xl font-bold text-gray-800 mb-6">
                  Chef's Specials
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Discover our exclusive daily selections, formatted by our
                  expert chefs using premium ingredients.
                </p>
                <div className="h-1 w-20 bg-gradient-to-r from-brand-dark to-brand-light rounded-full" />
              </div>
              <div className="w-full lg:w-2/3">
                <Carousel items={specialItems} onAddToCart={addToCart} />
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
              Why Choose Constance's Cuisine?
            </h2>
            <div className="h-1 w-20 bg-primary-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <ChefHat className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Expert Chefs
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Our years of passion and experience brings memorable taste and
                joy to every crafted dish.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Award className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Quality Ingredients
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                We shop only the Freshest, authentic, local and trusted
                supermarket for authentic taste.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Clock className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Fast Service
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Enjoy quick, efficient and delicious service, without
                compromising on quality, perfect for busy schedules or just a
                restful day.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Our Story
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                Since I was a little girl, I loved seeing my mom in the kitchen,
                teaching me different recipes ,different spices and ingredients.
                I always knew that it was my passion because when I find joy in
                cooking, and I love the compliments that I received like "You
                need to open a restaurant" ... They told me that million times,
                five years ago I decided to start my own gathering
                business,cooking for people that I love is one of my main love
                language.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Restaurant interior"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-t from-brand-dark to-brand-light opacity-70 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg mb-2">Open Daily: 12:00 AM - 8:00 PM</p>
          <a
            href="https://www.google.com/maps/place/390+14th+Ave,+Irvington,+NJ+07111"
            className="text-white text-decoration-underline hover:cursor-pointer"
          >
            390 14th Ave, Irvington, NJ 07111
          </a>
          {/* <p className="text-gray-400 mt-2">Phone: (555) 123-4567</p> */}
          <p className="text-white mt-4">
            &copy; 2025 Constance's Cuisine. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
