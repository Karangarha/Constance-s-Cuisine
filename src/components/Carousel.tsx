import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { MenuItem } from '../lib/supabase';

interface CarouselProps {
    items: MenuItem[];
    onAddToCart: (item: MenuItem) => void;
}

export default function Carousel({ items, onAddToCart }: CarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (items.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [items.length]);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
    };

    if (items.length === 0) return null;

    return (
        <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-2xl bg-white">
            <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {items.map((item) => (
                    <div key={item.id} className="w-full flex-shrink-0 relative h-[500px]">
                        <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-white">
                            <div className="max-w-3xl mx-auto">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold mb-3 inline-block">
                                            Special Offer
                                        </span>
                                        <h3 className="text-4xl font-bold mb-2">{item.name}</h3>
                                        <p className="text-lg text-gray-200 mb-4 max-w-xl">
                                            {item.description}
                                        </p>
                                        <p className="text-3xl font-bold text-orange-400">
                                            ${item.price.toFixed(2)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onAddToCart(item)}
                                        className="bg-white text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-full font-bold text-lg transition-colors flex items-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full text-white transition-all"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full text-white transition-all"
            >
                <ChevronRight className="w-8 h-8" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {items.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-orange-600 w-8' : 'bg-white/50'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
