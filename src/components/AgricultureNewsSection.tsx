import React, { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { fetchLatestAgricultureNews, AgricultureNews } from '../services/newsApi';

interface AgricultureNewsSectionProps {
  teluguMode: boolean;
}

export const AgricultureNewsSection: React.FC<AgricultureNewsSectionProps> = ({ teluguMode }) => {
  const [news, setNews] = useState<AgricultureNews | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const latestNews = await fetchLatestAgricultureNews(teluguMode);
      setNews(latestNews);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch agriculture news:', err);
      setError(teluguMode ? 'వార్తలు లోడ్ చేయడంలో విఫలమైంది' : 'Failed to load news');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh every 3 minutes (180,000 ms)
  useEffect(() => {
    // Initial fetch
    fetchNews();

    // Set up interval for auto-refresh
    const interval = setInterval(() => {
      fetchNews();
    }, 180000); // 3 minutes

    return () => clearInterval(interval);
  }, [teluguMode]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    if (!isLoading) {
      fetchNews();
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return teluguMode ? 'ఇప్పుడే అప్‌డేట్ అయ్యింది' : 'Just updated';
    } else if (diffInMinutes === 1) {
      return teluguMode ? '1 నిమిషం క్రితం అప్‌డేట్ అయ్యింది' : 'Updated 1 min ago';
    } else if (diffInMinutes < 60) {
      return teluguMode ? `${diffInMinutes} నిమిషాల క్రితం అప్‌డేట్ అయ్యింది` : `Updated ${diffInMinutes} mins ago`;
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      return teluguMode ? `${diffInHours} గంట${diffInHours > 1 ? 'లు' : ''} క్రితం అప్‌డేట్ అయ్యింది` : `Updated ${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <Newspaper className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              📰 {teluguMode ? 'తాజా వ్యవసాయ వార్తలు' : 'Latest Agri News'}
            </h2>
            <p className="text-sm text-gray-600">
              {teluguMode ? 'ప్రతి 3 నిమిషాలకు ఆటోమేటిక్ అప్‌డేట్' : 'Auto-updates every 3 minutes'}
            </p>
          </div>
        </div>
        
        {/* Manual Refresh Button */}
        <button
          onClick={handleManualRefresh}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 disabled:opacity-50"
          title={teluguMode ? 'మాన్యువల్ రిఫ్రెష్' : 'Manual refresh'}
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* News Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Loading State */}
        {isLoading && !news && (
          <div className="p-6 text-center">
            <div className="flex items-center justify-center space-x-3 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">
                {teluguMode ? 'తాజా వార్తలు లోడ్ చేస్తున్నాము...' : 'Loading latest news...'}
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !news && (
          <div className="p-6 text-center">
            <div className="text-red-600 font-medium mb-2">{error}</div>
            <button
              onClick={handleManualRefresh}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {teluguMode ? 'మళ్లీ ప్రయత్నించండి' : 'Try again'}
            </button>
          </div>
        )}

        {/* News Content */}
        {news && (
          <div className="p-6">
            {/* News Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">
                  🟢 {news.headline}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>
                      {lastUpdated ? getTimeAgo(lastUpdated) : ''}
                    </span>
                  </div>
                  {news.source && (
                    <div className="flex items-center space-x-1">
                      <ExternalLink size={14} />
                      <span>{news.source}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Loading indicator during refresh */}
              {isLoading && (
                <div className="ml-4">
                  <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                </div>
              )}
            </div>

            {/* News Content */}
            <p className="text-gray-700 leading-relaxed">
              {news.content}
            </p>

            {/* Auto-refresh indicator */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {teluguMode ? 'ఆటో-రిఫ్రెష్ ప్రతి 3 నిమిషాలకు' : 'Auto-refresh every 3 minutes'}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{teluguMode ? 'లైవ్' : 'Live'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          {teluguMode 
            ? '⚠️ వార్తలు AI ద్వారా రూపొందించబడ్డాయి మరియు వాస్తవ వార్తల మూలాలను తనిఖీ చేయాలి'
            : '⚠️ News generated by AI and should be verified with actual news sources'
          }
        </p>
      </div>
    </div>
  );
};