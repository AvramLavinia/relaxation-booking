// Example usage in a React component:
import React, { useState, useEffect } from 'react';
import { fetchFacilities } from 'api/facilities';
import { fetchActiveBookings, bookFacility } from 'api/bookings';

function FacilityList() {
  const [facilities, setFacilities] = useState([]);
  const [active, setActive] = useState([]);

  // Load facilities on mount
  useEffect(() => {
    fetchFacilities()
      .then(setFacilities)
      .catch(err => console.error(err));
  }, []);

  // Poll active bookings every 30 seconds
  useEffect(() => {
    const loadActive = () => {
      fetchActiveBookings()
        .then(setActive)
        .catch(err => console.error(err));
    };
    loadActive();
    const interval = setInterval(loadActive, 30000);
    return () => clearInterval(interval);
  }, []);

  const isOccupied = (slug) =>
    active.some(b => b.facility_slug === slug);

  const handleBook = (slug, duration) => {
    bookFacility(slug, duration)
      .then(() => {
        // Refresh active bookings after a successful booking
        return fetchActiveBookings();
      })
      .then(setActive)
      .catch(err => alert(err.message));
  };

  return (
    <ul className="space-y-3">
      {facilities.map(f => (
        <li key={f.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              {/* Render icon based on f.icon, e.g.: */}
              {f.icon === 'gamepad' ? <Gamepad size={24} /> : null}
              {/* (import your lucide-react icons at top of this file) */}
            </div>
            <div>
              <p className="font-medium">{f.name}</p>
              <p className={`text-sm ${isOccupied(f.slug) ? 'text-red-600' : 'text-green-600'}`}>
                {isOccupied(f.slug) ? 'Occupied' : 'Available'}
              </p>
            </div>
          </div>
          <div className="text-gray-700 font-medium">
            {/* Show a “Book” button only if available */}
            {!isOccupied(f.slug)
              ? <button onClick={() => handleBook(f.slug, f.defaultDuration ?? 10)}>
                  Book {f.defaultDuration ?? 10} min
                </button>
              : <span>{/* could show “10 min left” by calculating end_time − now */}</span>
            }
          </div>
        </li>
      ))}
    </ul>
  );
}

export default FacilityList;
