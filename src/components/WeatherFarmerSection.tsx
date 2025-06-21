import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Thermometer, 
  Droplets, 
  Wind, 
  Clock, 
  RefreshCw, 
  Loader2,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { fetchWeatherAndFarmingAdvice, WeatherData } from '../services/weatherApi';

interface WeatherFarmerSectionProps {
  teluguMode: boolean;
}

export const WeatherFarmerSection: React.FC<WeatherFarmerSectionProps> = ({ teluguMode }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState('Hyderabad, India');

  const fetchWeather = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchWeatherAndFarmingAdvice(location, teluguMode);
      setWeatherData(data);
    } catch (err) {
      console.error('Failed to fetch weather:', err);
      setError(teluguMode ? 'వాతావరణ డేటా లోడ్ చేయడంలో విఫలమైంది' : 'Failed to load weather data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [location, teluguMode]);

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
  };

  const handleRefresh = () => {
    if (!isLoading) {
      fetchWeather();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              🌤 {teluguMode ? 'వాతావరణం & రైతు సహాయం' : 'Weather & Farmer Help'}
            </h2>
            <p className="text-sm text-gray-600">
              {teluguMode ? 'వాతావరణం ఆధారంగా వ్యవసాయ సలహా' : 'Weather-based farming advice'}
            </p>
          </div>
        </div>
        
        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 disabled:opacity-50"
          title={teluguMode ? 'రిఫ్రెష్' : 'Refresh'}
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Location Input */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 max-w-md">
          <MapPin size={18} className="text-gray-500" />
          <input
            type="text"
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
            placeholder={teluguMode ? 'స్థానం నమోదు చేయండి...' : 'Enter location...'}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Weather Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Loading State */}
        {isLoading && (
          <div className="p-6 text-center">
            <div className="flex items-center justify-center space-x-3 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">
                {teluguMode ? 'వాతావరణ డేటా లోడ్ చేస్తున్నాము...' : 'Loading weather data...'}
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-red-600 mb-2">
              <AlertCircle size={18} />
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={handleRefresh}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {teluguMode ? 'మళ్లీ ప్రయత్నించండి' : 'Try again'}
            </button>
          </div>
        )}

        {/* Weather Content */}
        {weatherData && !isLoading && (
          <div className="p-6">
            {/* Current Weather */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{weatherData.weatherEmoji}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      📍 {weatherData.location}
                    </h3>
                    <p className="text-sm text-gray-600">
                      🕒 {weatherData.timeOfDay}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {weatherData.temperature}°C
                  </div>
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <Droplets className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <div className="text-sm text-gray-600">
                    {teluguMode ? 'వర్షం' : 'Rain'}
                  </div>
                  <div className="font-bold text-blue-600">
                    🌧 {weatherData.rainProbability}%
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <Droplets className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <div className="text-sm text-gray-600">
                    {teluguMode ? 'తేమ' : 'Humidity'}
                  </div>
                  <div className="font-bold text-green-600">
                    💧 {weatherData.humidity}%
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <Wind className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <div className="text-sm text-gray-600">
                    {teluguMode ? 'గాలి' : 'Wind'}
                  </div>
                  <div className="font-bold text-purple-600">
                    💨 {weatherData.windSpeed} km/h
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <Thermometer className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                  <div className="text-sm text-gray-600">
                    {teluguMode ? 'ఉష్ణోగ్రత' : 'Temp'}
                  </div>
                  <div className="font-bold text-orange-600">
                    🌡 {weatherData.temperature}°C
                  </div>
                </div>
              </div>

              {/* Farming Advice */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <h4 className="font-bold text-green-800 mb-2 flex items-center">
                  🌱 {teluguMode ? 'వ్యవసాయ సలహా:' : 'Farming Advice:'}
                </h4>
                <p className="text-green-700 leading-relaxed">
                  {weatherData.farmingAdvice}
                </p>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                📅 {teluguMode ? '5-రోజుల అంచనా:' : '5-Day Forecast:'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {weatherData.fiveDayForecast.map((day, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-3 text-center hover:bg-gray-100 transition-colors">
                    <div className="font-medium text-gray-700 text-sm mb-1">
                      📅 {day.day}
                    </div>
                    <div className="text-2xl mb-1">
                      {day.emoji}
                    </div>
                    <div className="font-bold text-gray-900 mb-2">
                      {day.temperature}°C
                    </div>
                    <div className="text-xs text-gray-600 leading-tight">
                      {day.advice}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Weather Tips */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          {teluguMode 
            ? '💡 వాతావరణ డేటా AI ద్వారా రూపొందించబడింది మరియు స్థానిక వాతావరణ సేవలతో తనిఖీ చేయాలి'
            : '💡 Weather data generated by AI and should be verified with local weather services'
          }
        </p>
      </div>
    </div>
  );
};