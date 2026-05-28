import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const Home = () => {
  const [stats, setStats] = useState({
    mealsSaved: 0,
    activeNGOs: 0,
    wastePrevented: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats/public');
        setStats(data);
      } catch (error) {
        console.error('Could not load public stats:', error);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (value, suffix = '') => {
    return `${Number(value || 0).toLocaleString('en-IN')}${suffix}`;
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative flex flex-grow items-center overflow-hidden bg-emerald-50 py-20">
        <div className="absolute inset-x-0 top-0 h-40 bg-white/70"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-3xl mx-auto animate-slide-up">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
              Don't Waste Food. <span className="text-green-600">Donate It.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Connect surplus food from events, restaurants, and individuals with those in need. Join our community of donors and volunteers to make a difference today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Donate Food
              </Link>
              <Link to="/register" className="btn-outline text-lg px-8 py-3">
                Find Food
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">Three simple steps to reduce waste and feed the hungry.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm shadow-emerald-950/5 border border-emerald-100 hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">1. Post Surplus Food</h3>
              <p className="text-gray-600">Donors list available food with photos, quantity, and expiry time.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm shadow-emerald-950/5 border border-amber-100 hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">2. Match via Location</h3>
              <p className="text-gray-600">NGOs and volunteers see live donations nearby on the map and claim them.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm shadow-emerald-950/5 border border-cyan-100 hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">3. Pickup & Deliver</h3>
              <p className="text-gray-600">The food is collected and distributed to those in need before it spoils.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-green-400">
            <div className="py-4">
              <div className="text-4xl font-extrabold mb-2">{formatNumber(stats.mealsSaved)}</div>
              <div className="text-green-100 font-medium">Meals Saved</div>
            </div>
            <div className="py-4">
              <div className="text-4xl font-extrabold mb-2">{formatNumber(stats.activeNGOs)}</div>
              <div className="text-green-100 font-medium">Active NGOs</div>
            </div>
            <div className="py-4">
              <div className="text-4xl font-extrabold mb-2">{formatNumber(stats.wastePrevented, 'kg')}</div>
              <div className="text-green-100 font-medium">Food Waste Prevented</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center">
        <p>&copy; {new Date().getFullYear()} FoodBridge. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
