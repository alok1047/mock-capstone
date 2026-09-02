import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[60vh] animate-fadeInUp">
      {/* Illustration */}
      <svg
        className="w-32 h-32 md:w-40 md:h-40 mb-6"
        viewBox="0 0 260 260"
        fill="none"
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle cx="130" cy="130" r="120" fill="#EFF6FF" />

        {/* Magnifying glass body */}
        <circle
          cx="115"
          cy="110"
          r="55"
          stroke="#3B82F6"
          strokeWidth="8"
          fill="white"
        />
        {/* Handle */}
        <line
          x1="155"
          y1="150"
          x2="200"
          y2="195"
          stroke="#3B82F6"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Question mark inside lens */}
        <text
          x="115"
          y="125"
          textAnchor="middle"
          fontSize="52"
          fontWeight="700"
          fill="#3B82F6"
          fontFamily="system-ui, sans-serif"
        >
          ?
        </text>

        {/* Small floating dots for decoration */}
        <circle cx="50" cy="60" r="5" fill="#BFDBFE" className="animate-pulse" />
        <circle cx="200" cy="50" r="4" fill="#BFDBFE" className="animate-pulse" />
        <circle cx="220" cy="130" r="3" fill="#DBEAFE" className="animate-pulse" />
        <circle cx="40" cy="180" r="4" fill="#DBEAFE" className="animate-pulse" />
      </svg>

      {/* Text content */}
      <h1 className="text-6xl md:text-8xl font-extrabold text-brand-blue tracking-tight">
        404
      </h1>
      <h2 className="mt-3 text-xl md:text-2xl font-semibold text-gray-800">
        Page Not Found
      </h2>
      <p className="mt-3 max-w-md text-gray-500 text-sm md:text-base leading-relaxed">
        Looks like this page got lost — just like the items we help you find!
        Let's get you back on track.
      </p>

      {/* Action buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          {/* Home icon */}
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
            />
          </svg>
          Go Home
        </Link>

        <Link
          to="/search-items"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 text-sm font-semibold rounded-lg border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          {/* Search icon */}
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Search Items
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
