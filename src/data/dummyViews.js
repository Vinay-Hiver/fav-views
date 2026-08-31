// Dummy Views data per Shared Inbox.
// `views` holds every View in the inbox (system + custom), in catalogue order.
// `favouriteIds` is the ordered list of the user's favourited View ids for that
// inbox (max 5) — this order drives both the All Views "Favourites" group and
// the home screen nav.
export const INITIAL_VIEWS_BY_INBOX = {
  Support: {
    views: [
      { id: 'mine', name: 'Mine', type: 'system', icon: 'mine', count: 2 },
      { id: 'unassigned', name: 'Unassigned', type: 'system', icon: 'unassigned', count: 4 },
      { id: 'team', name: 'Team', type: 'system', icon: 'team', count: 12 },
      { id: 'tickets', name: 'Tickets', type: 'system', icon: 'tickets', count: 8 },
      { id: 'pending', name: 'Pending', type: 'system', icon: 'pending', count: 5 },
      { id: 'closed', name: 'Closed', type: 'system', icon: 'closed', count: 23 },
      { id: 'custom-1', name: 'Escalated', type: 'custom', icon: 'layers', count: 3 },
      { id: 'custom-2', name: 'VIP Customers', type: 'custom', icon: 'layers', count: 6 },
    ],
    favouriteIds: ['mine', 'unassigned'],
  },
  Finance: {
    views: [
      { id: 'mine', name: 'Mine', type: 'system', icon: 'mine', count: 5 },
      { id: 'unassigned', name: 'Unassigned', type: 'system', icon: 'unassigned', count: 3 },
      { id: 'team', name: 'Team', type: 'system', icon: 'team', count: 9 },
      { id: 'tickets', name: 'Tickets', type: 'system', icon: 'tickets', count: 4 },
      { id: 'pending', name: 'Pending', type: 'system', icon: 'pending', count: 11 },
      { id: 'closed', name: 'Closed', type: 'system', icon: 'closed', count: 40 },
      { id: 'custom-1', name: 'Invoices Overdue', type: 'custom', icon: 'layers', count: 7 },
    ],
    favouriteIds: ['mine'],
  },
  Shipping: {
    views: [
      { id: 'mine', name: 'Mine', type: 'system', icon: 'mine', count: 3 },
      { id: 'unassigned', name: 'Unassigned', type: 'system', icon: 'unassigned', count: 2 },
      { id: 'team', name: 'Team', type: 'system', icon: 'team', count: 6 },
      { id: 'tickets', name: 'Tickets', type: 'system', icon: 'tickets', count: 5 },
      { id: 'pending', name: 'Pending', type: 'system', icon: 'pending', count: 9 },
      { id: 'closed', name: 'Closed', type: 'system', icon: 'closed', count: 17 },
      { id: 'custom-1', name: 'Delayed Orders', type: 'custom', icon: 'layers', count: 2 },
    ],
    favouriteIds: ['mine'],
  },
  Refund: {
    views: [
      { id: 'mine', name: 'Mine', type: 'system', icon: 'mine', count: 2 },
      { id: 'unassigned', name: 'Unassigned', type: 'system', icon: 'unassigned', count: 3 },
      { id: 'team', name: 'Team', type: 'system', icon: 'team', count: 5 },
      { id: 'tickets', name: 'Tickets', type: 'system', icon: 'tickets', count: 2 },
      { id: 'pending', name: 'Pending', type: 'system', icon: 'pending', count: 6 },
      { id: 'closed', name: 'Closed', type: 'system', icon: 'closed', count: 14 },
    ],
    favouriteIds: ['mine'],
  },
  'IT Support': {
    views: [
      { id: 'mine', name: 'Mine', type: 'system', icon: 'mine', count: 3 },
      { id: 'unassigned', name: 'Unassigned', type: 'system', icon: 'unassigned', count: 2 },
      { id: 'team', name: 'Team', type: 'system', icon: 'team', count: 7 },
      { id: 'tickets', name: 'Tickets', type: 'system', icon: 'tickets', count: 3 },
      { id: 'pending', name: 'Pending', type: 'system', icon: 'pending', count: 4 },
      { id: 'closed', name: 'Closed', type: 'system', icon: 'closed', count: 19 },
      { id: 'custom-1', name: 'Access Requests', type: 'custom', icon: 'layers', count: 5 },
    ],
    favouriteIds: ['mine'],
  },
};

export const MAX_FAVOURITES = 5;
