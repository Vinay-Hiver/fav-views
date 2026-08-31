import React from 'react';

export const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

export const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#f59e0b' : 'none'} stroke={filled ? '#f59e0b' : 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

// Six-dot drag handle, shown in place of the view's type icon on hover
// within the Favourites section, to indicate the row can be reordered.
export const DragHandleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" draggable="false" style={{ pointerEvents: 'none' }}>
    <circle cx="5" cy="3" r="1.3"></circle>
    <circle cx="11" cy="3" r="1.3"></circle>
    <circle cx="5" cy="8" r="1.3"></circle>
    <circle cx="11" cy="8" r="1.3"></circle>
    <circle cx="5" cy="13" r="1.3"></circle>
    <circle cx="11" cy="13" r="1.3"></circle>
  </svg>
);

export const ViewTypeIcon = ({ icon }) => {
  switch (icon) {
    case 'mine':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"></circle>
          <path d="M4 21v-1a7 7 0 0 1 14 0v1"></path>
        </svg>
      );
    case 'unassigned':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="8" r="4"></circle>
          <path d="M2 21v-1a6 6 0 0 1 11-3.5"></path>
          <line x1="17" y1="9" x2="23" y2="9"></line>
        </svg>
      );
    case 'team':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-1a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      );
    case 'tickets':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z"></path>
        </svg>
      );
    case 'pending':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <rect x="9" y="8" width="2" height="8"></rect>
          <rect x="13" y="8" width="2" height="8"></rect>
        </svg>
      );
    case 'closed':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="8 12 11 15 16 9"></polyline>
        </svg>
      );
    case 'layers':
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      );
  }
};
