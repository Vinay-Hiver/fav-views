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
  <svg width="14" height="14" viewBox="0 0 14 14" fill={filled ? '#eab308' : 'none'} stroke={filled ? '#eab308' : 'currentColor'} strokeWidth="1.18462" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.06307 1.648C6.2078 1.35467 6.28024 1.208 6.3785 1.16114C6.46399 1.12037 6.56337 1.12037 6.64887 1.16114C6.74718 1.208 6.81955 1.35467 6.96435 1.648L8.33806 4.43092C8.38077 4.51752 8.40213 4.56082 8.43335 4.59444C8.46105 4.62421 8.49422 4.64833 8.53104 4.66546C8.57268 4.68481 8.62044 4.6918 8.71598 4.70576L11.7888 5.15489C12.1123 5.20218 12.2741 5.22582 12.349 5.30486C12.4141 5.37362 12.4447 5.46811 12.4323 5.56201C12.4181 5.66994 12.3009 5.78402 12.0667 6.01219L9.84405 8.17699C9.77482 8.24446 9.74015 8.27825 9.71778 8.3184C9.69799 8.35389 9.6853 8.39297 9.6804 8.43336C9.67487 8.47897 9.68304 8.52665 9.69937 8.62194L10.2239 11.6797C10.2791 12.0022 10.3068 12.1634 10.2548 12.2592C10.2096 12.3424 10.1293 12.4008 10.0361 12.4181C9.92898 12.4379 9.78418 12.3617 9.49457 12.2094L6.74762 10.7648C6.662 10.7198 6.61922 10.6973 6.57412 10.6885C6.53422 10.6806 6.49314 10.6806 6.45325 10.6885C6.40814 10.6973 6.36536 10.7198 6.2798 10.7648L3.5328 12.2094C3.2432 12.3617 3.09839 12.4379 2.99132 12.4181C2.89816 12.4008 2.81778 12.3424 2.77256 12.2592C2.72058 12.1634 2.74824 12.0022 2.80354 11.6797L3.32798 8.62194C3.34433 8.52665 3.35252 8.47897 3.34698 8.43336C3.34208 8.39297 3.32938 8.35389 3.30959 8.3184C3.28723 8.27825 3.2526 8.24446 3.18331 8.17699L0.9607 6.01219C0.726442 5.78402 0.609314 5.66994 0.595066 5.56201C0.582666 5.46811 0.613297 5.37362 0.678442 5.30486C0.753317 5.22582 0.915099 5.20218 1.23867 5.15489L4.31139 4.70576C4.40694 4.6918 4.45472 4.68481 4.49634 4.66546C4.53318 4.64833 4.56635 4.62421 4.594 4.59444C4.62524 4.56082 4.64661 4.51752 4.68935 4.43092L6.06307 1.648Z"></path>
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

// Vertical kebab menu shown on custom views in place of the count.
export const KebabIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.8"></circle>
    <circle cx="12" cy="12" r="1.8"></circle>
    <circle cx="12" cy="19" r="1.8"></circle>
  </svg>
);

// Untitled UI "users-plus" glyph, from the Omni Figma file (node 305:4440).
// Used both for the "Add to Team Favourites" kebab menu item and — in place
// of the old heart-circle placeholder — on a view's row icon while it's a
// Team Favourite, to visually flag it as team-pinned.
export const UsersStarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.66667 10H5.33333C4.09082 10 3.46957 10 2.97951 10.203C2.3261 10.4736 1.80697 10.9928 1.53632 11.6462C1.33333 12.1362 1.33333 12.7575 1.33333 14M10.3333 2.19384C11.3106 2.58943 12 3.54754 12 4.66667C12 5.78579 11.3106 6.7439 10.3333 7.13949M9 4.66667C9 6.13943 7.80609 7.33333 6.33333 7.33333C4.86057 7.33333 3.66667 6.13943 3.66667 4.66667C3.66667 3.19391 4.86057 2 6.33333 2C7.80609 2 9 3.19391 9 4.66667Z" strokeWidth="1.1"></path>
    <path d="M12.1374 8.66667L13.0039 10.422L14.9415 10.7052L13.5394 12.0708L13.8703 14L12.1374 13.0887L10.4045 14L10.7354 12.0708L9.33333 10.7052L11.2709 10.422L12.1374 8.66667Z" strokeWidth="0.9"></path>
  </svg>
);

// Kept as a separate export name (used for the row icon) even though it's
// the same glyph as UsersStarIcon, just sized for a 14px row icon slot.
export const HeartCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.66667 10H5.33333C4.09082 10 3.46957 10 2.97951 10.203C2.3261 10.4736 1.80697 10.9928 1.53632 11.6462C1.33333 12.1362 1.33333 12.7575 1.33333 14M10.3333 2.19384C11.3106 2.58943 12 3.54754 12 4.66667C12 5.78579 11.3106 6.7439 10.3333 7.13949M9 4.66667C9 6.13943 7.80609 7.33333 6.33333 7.33333C4.86057 7.33333 3.66667 6.13943 3.66667 4.66667C3.66667 3.19391 4.86057 2 6.33333 2C7.80609 2 9 3.19391 9 4.66667Z" strokeWidth="1.1"></path>
    <path d="M12.1374 8.66667L13.0039 10.422L14.9415 10.7052L13.5394 12.0708L13.8703 14L12.1374 13.0887L10.4045 14L10.7354 12.0708L9.33333 10.7052L11.2709 10.422L12.1374 8.66667Z" strokeWidth="0.9"></path>
  </svg>
);

export const PencilIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
  </svg>
);

export const SlidersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"></line>
    <line x1="4" y1="10" x2="4" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12" y2="3"></line>
    <line x1="20" y1="21" x2="20" y2="16"></line>
    <line x1="20" y1="12" x2="20" y2="3"></line>
    <line x1="1" y1="14" x2="7" y2="14"></line>
    <line x1="9" y1="8" x2="15" y2="8"></line>
    <line x1="17" y1="16" x2="23" y2="16"></line>
  </svg>
);

export const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

export const ViewTypeIcon = ({ icon }) => {
  switch (icon) {
    // Icons below are sourced from the Omni Figma file (node 306:5519).
    case 'mine':
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.48571" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13.3334 14C13.3334 13.0696 13.3334 12.6045 13.2185 12.2259C12.96 11.3737 12.293 10.7067 11.4407 10.4481C11.0622 10.3333 10.5971 10.3333 9.66667 10.3333H6.33334C5.40296 10.3333 4.93777 10.3333 4.55925 10.4481C3.70697 10.7067 3.04003 11.3737 2.7815 12.2259C2.66667 12.6045 2.66667 13.0696 2.66667 14M11 5C11 6.65686 9.65687 8 8 8C6.34315 8 5 6.65686 5 5C5 3.34314 6.34315 2 8 2C9.65687 2 11 3.34314 11 5Z"></path>
        </svg>
      );
    case 'unassigned':
      return (
        <svg width="14" height="14" viewBox="0 0 15 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.88816 8.9833H4.31672C3.38635 8.9833 2.92115 8.9833 2.54263 9.0981C1.69035 9.3567 1.02341 10.0237 0.764882 10.8759C0.650052 11.2545 0.650052 11.7196 0.650052 12.65M8.98339 3.65C8.98339 5.30685 7.64025 6.65 5.98339 6.65C4.32653 6.65 2.98339 5.30685 2.98339 3.65C2.98339 1.99315 4.32653 0.65 5.98339 0.65C7.64025 0.65 8.98339 1.99315 8.98339 3.65Z"></path>
          <path d="M10.7453 7.65146C10.8627 7.3176 11.0946 7.036 11.3997 6.85666C11.7049 6.67726 12.0637 6.61173 12.4126 6.67159C12.7615 6.73139 13.0779 6.91279 13.3059 7.18359C13.5339 7.45439 13.6586 7.79713 13.6581 8.15113C13.6581 9.1504 12.1592 9.65 12.1592 9.65M12.1786 11.65H12.1853"></path>
        </svg>
      );
    case 'team':
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.48571" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.6666 14V12.6666C14.6666 11.4241 13.8168 10.3801 12.6666 10.084M10.3333 2.19384C11.3106 2.58943 12 3.54754 12 4.66666C12 5.78579 11.3106 6.74393 10.3333 7.13946M11.3333 14C11.3333 12.7575 11.3333 12.1362 11.1303 11.6462C10.8597 10.9928 10.3405 10.4737 9.68714 10.203C9.19707 10 8.57587 10 7.33334 10H5.33334C4.09082 10 3.46958 10 2.97952 10.203C2.3261 10.4737 1.80698 10.9928 1.53633 11.6462C1.33334 12.1362 1.33334 12.7575 1.33334 14M9 4.66666C9 6.13943 7.80607 7.33334 6.33334 7.33334C4.86058 7.33334 3.66667 6.13943 3.66667 4.66666C3.66667 3.19391 4.86058 2 6.33334 2C7.80607 2 9 3.19391 9 4.66666Z"></path>
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
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5.65 9.31663V5.31667M8.98333 9.31663V5.31667M13.9833 7.31667C13.9833 10.9985 10.9986 13.9833 7.31666 13.9833C3.63477 13.9833 0.65 10.9985 0.65 7.31667C0.65 3.63477 3.63477 0.65 7.31666 0.65C10.9986 0.65 13.9833 3.63477 13.9833 7.31667Z"></path>
        </svg>
      );
    case 'closed':
      return (
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.31666 7.31667L6.31666 9.31663L10.3167 5.31667M13.9833 7.31667C13.9833 10.9985 10.9986 13.9833 7.31666 13.9833C3.63477 13.9833 0.65 10.9985 0.65 7.31667C0.65 3.63477 3.63477 0.65 7.31666 0.65C10.9986 0.65 13.9833 3.63477 13.9833 7.31667Z"></path>
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
