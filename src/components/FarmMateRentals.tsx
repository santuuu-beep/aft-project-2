import React, { useState } from 'react';
import { 
  Tractor, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Filter, 
  Search,
  Star,
  Clock,
  CheckCircle,
  CreditCard,
  Smartphone,
  X
} from 'lucide-react';

interface Machine {
  id: string;
  name: string;
  image: string;
  pricePerDay: number;
  location: string;
  availableDates: string;
  rating: number;
  type: string;
  description: string;
}

interface FarmMateRentalsProps {
  teluguMode: boolean;
}

export const FarmMateRentals: React.FC<FarmMateRentalsProps> = ({ teluguMode }) => {
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    priceRange: '',
    machineType: ''
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Sample machine data
  const machines: Machine[] = [
    {
      id: '1',
      name: 'Mahindra 575 DI',
      image: 'https://images.pexels.com/photos/158028/bellingrath-gardens-alabama-landscape-scenic-158028.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      pricePerDay: 1500,
      location: 'Hyderabad',
      availableDates: 'June 21-25',
      rating: 4.8,
      type: 'Tractor',
      description: 'Heavy-duty tractor perfect for plowing and cultivation'
    },
    {
      id: '2',
      name: 'John Deere Harvester',
      image: 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      pricePerDay: 2500,
      location: 'Warangal',
      availableDates: 'June 22-28',
      rating: 4.9,
      type: 'Harvester',
      description: 'Efficient harvesting machine for rice and wheat'
    },
    {
      id: '3',
      name: 'DJI Agriculture Drone',
      image: 'https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      pricePerDay: 800,
      location: 'Nizamabad',
      availableDates: 'June 20-30',
      rating: 4.7,
      type: 'Drone',
      description: 'Precision spraying drone for pesticides and fertilizers'
    },
    {
      id: '4',
      name: 'Kubota Transplanter',
      image: 'https://images.pexels.com/photos/1595108/pexels-photo-1595108.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      pricePerDay: 1200,
      location: 'Karimnagar',
      availableDates: 'June 25-30',
      rating: 4.6,
      type: 'Transplanter',
      description: 'Automated rice transplanting machine'
    }
  ];

  const machineTypes = ['All', 'Tractor', 'Harvester', 'Drone', 'Transplanter'];
  const locations = ['All', 'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'];
  const priceRanges = ['All', '₹500-1000', '₹1000-2000', '₹2000+'];

  const filteredMachines = machines.filter(machine => {
    const locationMatch = !filters.location || filters.location === 'All' || machine.location.includes(filters.location);
    const typeMatch = !filters.machineType || filters.machineType === 'All' || machine.type === filters.machineType;
    const priceMatch = !filters.priceRange || filters.priceRange === 'All' || 
      (filters.priceRange === '₹500-1000' && machine.pricePerDay <= 1000) ||
      (filters.priceRange === '₹1000-2000' && machine.pricePerDay > 1000 && machine.pricePerDay <= 2000) ||
      (filters.priceRange === '₹2000+' && machine.pricePerDay > 2000);
    
    return locationMatch && typeMatch && priceMatch;
  });

  const handleBookNow = (machine: Machine) => {
    setSelectedMachine(machine);
    setShowPayment(true);
  };

  const handlePayment = () => {
    setShowPayment(false);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedMachine(null);
    }, 3000);
  };

  const closeModal = () => {
    setShowPayment(false);
    setSelectedMachine(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 mb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-400 to-yellow-400 rounded-3xl p-8 mb-8 text-center shadow-xl">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            🌟 {teluguMode ? 'ఫార్మ్‌మేట్ రెంటల్స్' : 'FarmMate Rentals'}
          </h2>
          <p className="text-xl text-white/90 mb-2">
            {teluguMode 
              ? 'మీ గ్రామానికి సరసమైన వ్యవసాయ యంత్రాలు'
              : 'Affordable Farm Machines. Delivered to Your Village.'}
          </p>
          <p className="text-lg text-white/80">
            {teluguMode 
              ? 'ట్రాక్టర్లు, డ్రోన్లు మరియు హార్వెస్టర్లను సులభంగా అద్దెకు తీసుకోండి'
              : 'Rent tractors, drones, and harvesters with ease.'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-bold text-gray-900">
            {teluguMode ? 'ఫిల్టర్లు:' : 'Filters:'}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 {teluguMode ? 'స్థానం' : 'Location'}
            </label>
            <select
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {locations.map(location => (
                <option key={location} value={location}>
                  {location === 'All' ? (teluguMode ? 'అన్నీ' : 'All') : location}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💸 {teluguMode ? 'ధర పరిధి' : 'Price Range'}
            </label>
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {priceRanges.map(range => (
                <option key={range} value={range}>
                  {range === 'All' ? (teluguMode ? 'అన్నీ' : 'All') : range}
                </option>
              ))}
            </select>
          </div>

          {/* Machine Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🚜 {teluguMode ? 'యంత్రం రకం' : 'Machine Type'}
            </label>
            <select
              value={filters.machineType}
              onChange={(e) => setFilters({...filters, machineType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {machineTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'All' ? (teluguMode ? 'అన్నీ' : 'All') : type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Machine Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMachines.map((machine) => (
          <div key={machine.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 overflow-hidden">
            {/* Machine Image */}
            <div className="relative h-48 bg-gray-200">
              <img 
                src={machine.image} 
                alt={machine.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-green-600">
                ⭐ {machine.rating}
              </div>
            </div>

            {/* Machine Details */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                🚜 {machine.name}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3">
                {machine.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-600">
                    <DollarSign size={14} className="mr-1" />
                    {teluguMode ? 'రోజుకు:' : 'Per day:'}
                  </span>
                  <span className="font-bold text-green-600">
                    💰 ₹{machine.pricePerDay}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-600">
                    <MapPin size={14} className="mr-1" />
                    {teluguMode ? 'స్థానం:' : 'Location:'}
                  </span>
                  <span className="text-gray-900">
                    📍 {machine.location}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-600">
                    <Calendar size={14} className="mr-1" />
                    {teluguMode ? 'అందుబాటులో:' : 'Available:'}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    🗓 {machine.availableDates}
                  </span>
                </div>
              </div>

              {/* Book Now Button */}
              <button
                onClick={() => handleBookNow(machine)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ✅ {teluguMode ? 'ఇప్పుడే బుక్ చేయండి' : 'Book Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPayment && selectedMachine && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                💳 {teluguMode ? 'చెల్లింపు' : 'Payment'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h4 className="font-bold text-gray-900 mb-2">
                  🚜 {selectedMachine.name}
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>📍 {selectedMachine.location}</div>
                  <div>🗓 {selectedMachine.availableDates}</div>
                  <div className="font-bold text-green-600">
                    💰 ₹{selectedMachine.pricePerDay}/day
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePayment}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <Smartphone size={18} />
                  <span>{teluguMode ? 'UPI చెల్లింపు' : 'UPI Payment'}</span>
                </button>
                
                <button
                  onClick={handlePayment}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <CreditCard size={18} />
                  <span>{teluguMode ? 'కార్డ్ చెల్లింపు' : 'Card Payment'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ✅ {teluguMode ? 'బుకింగ్ ధృవీకరించబడింది!' : 'Booking Confirmed!'}
            </h3>
            <p className="text-gray-600">
              {teluguMode 
                ? 'యంత్రం ఎంచుకున్న సమయంలో సిద్ధంగా ఉంటుంది.'
                : 'Machine ready at selected time.'}
            </p>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          {teluguMode 
            ? '🚜 ఫార్మ్‌మేట్ రెంటల్స్ - మీ వ్యవసాయ అవసరాలకు విశ్వసనీయ భాగస్వామి'
            : '🚜 FarmMate Rentals - Your trusted partner for farming needs'
          }
        </p>
      </div>
    </div>
  );
};