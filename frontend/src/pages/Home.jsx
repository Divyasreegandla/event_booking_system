import React, { useState, useEffect } from 'react';
import { getEvents, advancedSearch, getCities, getAllCategories } from '../services/api';
import EventCard from '../components/EventCard';
import DateRangePicker from '../components/DateRangePicker';
import PriceRangeSlider from '../components/PriceRangeSlider';
import SortDropdown from '../components/SortDropdown';
import FeaturedEvents from '../components/FeaturedEvents';
import RecommendationsSection from '../components/RecommendationsSection';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(['All']);
  const [cities, setCities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchFilters();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, selectedCategory, selectedCity, searchTerm, sortBy, startDate, endDate, minPrice, maxPrice]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents();
      setEvents(response.data);
      setFilteredEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [categoriesRes, citiesRes] = await Promise.all([
        getAllCategories().catch(() => ({ data: [] })),
        getCities().catch(() => ({ data: [] }))
      ]);
      setCategories(['All', ...(categoriesRes.data || [])]);
      setCities(['All', ...(citiesRes.data || [])]);
    } catch (error) {
      console.error('Failed to fetch filters:', error);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    if (selectedCity !== 'All') {
      filtered = filtered.filter(event => event.city === selectedCity);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (startDate) {
      filtered = filtered.filter(event => new Date(event.event_date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(event => new Date(event.event_date) <= new Date(endDate));
    }
    
    filtered = filtered.filter(event => event.price >= minPrice && event.price <= maxPrice);
    
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.event_date) - new Date(b.event_date);
      } else if (sortBy === 'price_low') {
        return a.price - b.price;
      } else if (sortBy === 'price_high') {
        return b.price - a.price;
      } else if (sortBy === 'popularity') {
        return (b.total_tickets - b.available_tickets) - (a.total_tickets - a.available_tickets);
      }
      return 0;
    });
    
    setFilteredEvents(filtered);
  };

  const handleDateChange = (start, end) => {
    setStartDate(start || '');
    setEndDate(end || '');
  };

  const handlePriceChange = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedCity('All');
    setSearchTerm('');
    setSortBy('date');
    setStartDate('');
    setEndDate('');
    setMinPrice(0);
    setMaxPrice(15000);
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const hasActiveFilters = selectedCategory !== 'All' || selectedCity !== 'All' || searchTerm || startDate || endDate || minPrice > 0 || maxPrice < 15000;

  return (
    <div>
      <div className="hero">
        <h1>Discover Amazing Events</h1>
        <p>Book tickets for concerts, conferences, sports, comedy, and more!</p>
      </div>
      
      {/* Featured Events Carousel */}
      <FeaturedEvents events={events} />

      {/* Recommendations Section - Module 19 */}
      <RecommendationsSection />

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search events by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Advanced Filters Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: '8px 16px',
            background: showFilters ? '#6366f1' : '#f3f4f6',
            color: showFilters ? 'white' : '#374151',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🔧</span> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        
        <SortDropdown onSortChange={handleSortChange} currentSort={sortBy} />
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            style={{
              padding: '8px 16px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #eef2ff'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ fontWeight: '600', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  background: 'white'
                }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ fontWeight: '600', fontSize: '13px', display: 'block', marginBottom: '8px' }}>City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  background: 'white'
                }}
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ fontWeight: '600', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Date Range</label>
              <DateRangePicker onDateChange={handleDateChange} startDate={startDate} endDate={endDate} />
            </div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <PriceRangeSlider onPriceChange={handlePriceChange} minPrice={0} maxPrice={15000} />
          </div>
        </div>
      )}

      {/* Category Quick Filters */}
      <div className="category-filters">
        {categories.slice(0, 6).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
          >
            {cat === 'All' ? 'All Events' : cat}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="results-count">
        Found {filteredEvents.length} amazing events for you
      </div>

      {/* No Results */}
      {filteredEvents.length === 0 ? (
        <div className="no-results">
          <span>🎟️</span>
          <p>No events found. Try adjusting your filters.</p>
          <button onClick={clearAllFilters} className="btn-primary" style={{ marginTop: '16px' }}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;