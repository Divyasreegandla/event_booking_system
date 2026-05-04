import React from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';

const FeaturedEvents = ({ events }) => {
  const navigate = useNavigate();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } }
    ]
  };

  if (!events || events.length === 0) return null;

  const featured = events.slice(0, 6); // First 6 events as featured

  return (
    <div style={{ margin: '3rem 0' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        🔥 Featured Events
      </h2>
      <Slider {...settings}>
        {featured.map(event => (
          <div key={event.id} style={{ padding: '0 10px' }}>
            <div 
              onClick={() => navigate(`/events/${event.id}`)}
              style={{
                background: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s',
                margin: '10px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                height: '180px',
                background: `url(${event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=200&fit=crop'}) center/cover`
              }} />
              <div style={{ padding: '15px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>{event.title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>📍 {event.city}</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#6366f1', marginTop: '8px' }}>
                  ₹{event.price}
                </p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default FeaturedEvents;