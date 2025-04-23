import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

// Icons
const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CategoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const ItemCard = ({ 
  id, 
  title, 
  image, 
  location, 
  date, 
  category, 
  type // 'lost' or 'found'
}) => {
  // Format date if it's a valid date string
  const formattedDate = date ? new Date(date).toLocaleDateString() : date;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 h-full">
      {/* Item Status Badge */}
      <div className="relative">
        <img 
          src={image || "https://via.placeholder.com/300x200?text=No+Image"} 
          alt={title} 
          className="w-full h-48 object-cover"
        />
        <div className={`absolute top-3 left-3 text-xs font-bold py-1 px-2 rounded-md ${
          type === 'lost' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {type === 'lost' ? 'Lost' : 'Found'}
        </div>
      </div>
      
      {/* Item Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        
        <div className="space-y-2 mb-4">
          {location && (
            <div className="flex items-center text-sm text-gray-600">
              <LocationIcon />
              <span className="ml-2">{location}</span>
            </div>
          )}
          
          {formattedDate && (
            <div className="flex items-center text-sm text-gray-600">
              <DateIcon />
              <span className="ml-2">{formattedDate}</span>
            </div>
          )}
          
          {category && (
            <div className="flex items-center text-sm text-gray-600">
              <CategoryIcon />
              <span className="ml-2">{category}</span>
            </div>
          )}
        </div>
        
        <Link 
          to={`/item/${id}`} 
          className="text-brand-blue hover:text-brand-blue-dark text-sm font-medium"
        >
          View details →
        </Link>
      </div>
    </div>
  );
};

ItemCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  image: PropTypes.string,
  location: PropTypes.string,
  date: PropTypes.string,
  category: PropTypes.string,
  type: PropTypes.oneOf(['lost', 'found']).isRequired
};

export default ItemCard;