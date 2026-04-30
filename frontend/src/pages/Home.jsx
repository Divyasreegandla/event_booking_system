import React, { useState, useEffect } from 'react';
import { getEvents } from '../services/api';
import EventCard from '../components/EventCard';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories] = useState(['All', 'Music', 'Tech', 'Sports', 'Business', 'Comedy']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, selectedCategory, searchTerm]);

  const fetchEvents = async () => {
    try {
      const response = await getEvents();
      setEvents(response.data);
      setFilteredEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredEvents(filtered);
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="hero">
        <h1>Discover Amazing Events</h1>
        <p>Book tickets for concerts, conferences, sports, comedy, and more!</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search events by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="category-filters">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
          >
            {cat === 'All' ? 'All Events' : cat}
          </button>
        ))}
      </div>

      <div className="results-count">
        Found {filteredEvents.length} amazing events for you
      </div>

      {filteredEvents.length === 0 ? (
        <div className="no-results">
          <span>🎟️</span>
          <p>No events found. Try a different search or category.</p>
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