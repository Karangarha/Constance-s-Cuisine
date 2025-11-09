import { ChefHat, Clock, Award } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: 'menu') => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen">
      <section
        className="relative h-[600px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1600)',
        }}
      >
        <div className="text-center text-white px-4">
          <h1 className="text-6xl font-bold mb-6">Welcome to Savoria</h1>
          <p className="text-2xl mb-8 max-w-2xl mx-auto">
            Experience culinary excellence with fresh, locally-sourced ingredients
            and authentic flavors
          </p>
          <button
            onClick={() => onNavigate('menu')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-full text-xl transition-all transform hover:scale-105"
          >
            Explore Our Menu
          </button>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
            Why Choose Savoria?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
                <ChefHat className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Expert Chefs
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our talented chefs bring years of experience and passion to every
                dish, crafting memorable culinary experiences.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
                <Award className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Quality Ingredients
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We source only the finest, freshest ingredients from local farms
                and trusted suppliers for exceptional taste.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
                <Clock className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Fast Service
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Enjoy quick and efficient service without compromising on quality,
                perfect for busy schedules.
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
                Founded in 2010, Savoria has been serving the community with
                exceptional dining experiences. Our commitment to quality,
                authenticity, and innovation has made us a beloved destination for
                food lovers.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                Every dish tells a story, blending traditional techniques with
                modern culinary artistry. Join us on this delicious journey and
                discover why Savoria is more than just a restaurant.
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

      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg mb-2">Open Daily: 11:00 AM - 10:00 PM</p>
          <p className="text-gray-400">123 Culinary Street, Food City, FC 12345</p>
          <p className="text-gray-400 mt-2">Phone: (555) 123-4567</p>
          <p className="text-gray-400 mt-4">
            &copy; 2025 Savoria. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
