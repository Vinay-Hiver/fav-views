import React from 'react';
import AllViewsPanel from './AllViewsPanel';
import { ViewTypeIcon, HeartCircleIcon } from './viewIcons';
import { INITIAL_VIEWS_BY_INBOX } from '../data/dummyViews';

// Icons
import allMailIcon from '../assets/icons/all-mail.svg';
import assignedToMeIcon from '../assets/icons/assigned-to-me.svg';
import draftIcon from '../assets/icons/draft.svg';
import inboxIcon from '../assets/icons/inbox-icon.svg';
import newConversationIcon from '../assets/icons/new-conversation.svg';
import sentIcon from '../assets/icons/sent.svg';
import tagsIcon from '../assets/icons/tags.svg';

import sChevronDown from '../assets/icons/Read/side-bar-chevron.svg';

// Same "layers" glyph used for custom Views in the All Views panel
const LayersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="item-icon">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

const MainSidebarPanel = ({ activeFilter, onFilterChange, activeRole }) => {
  const [expandedInboxes, setExpandedInboxes] = React.useState({
    support: true,
    finance: false,
    shipping: false,
    refund: false,
    itSupport: false
  });

  const [allViewsInbox, setAllViewsInbox] = React.useState(null);

  // Switching Admin/Agent always drops back to the home nav — e.g. an admin
  // pinning Team Favourites from within All Views, then flipping to Agent to
  // see how it looks, should land on the sidebar's home screen first.
  const isFirstRoleRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRoleRender.current) {
      isFirstRoleRender.current = false;
      return;
    }
    setAllViewsInbox(null);
  }, [activeRole]);

  // Views (and each inbox's favourited View ids, in display order) live here
  // so they persist across opening/closing All Views and drive the home nav.
  const [viewsByInbox, setViewsByInbox] = React.useState(INITIAL_VIEWS_BY_INBOX);

  const toggleInbox = (inbox) => {
    setExpandedInboxes(prev => ({
      ...prev,
      [inbox]: !prev[inbox]
    }));
  };

  const renderNestedItems = (inboxName) => {
    const { views, favouriteIds: favouriteIdsByRole, teamFavouriteIds } = viewsByInbox[inboxName];
    const favouriteIds = favouriteIdsByRole[activeRole] || [];
    const viewsById = {};
    views.forEach((v) => { viewsById[v.id] = v; });
    const favouritedViews = favouriteIds.map((id) => viewsById[id]).filter(Boolean);

    return (
      <div className="nav-group-nested">
        {favouritedViews.map((view) => (
          <div
            key={view.id}
            className={`nav-item ${activeFilter.inbox === inboxName && activeFilter.type === view.name ? 'active' : ''}`}
            onClick={() => onFilterChange({ inbox: inboxName, type: view.name })}
          >
            <div className="nav-content">
              <span className="item-icon">
                {teamFavouriteIds.includes(view.id) ? <HeartCircleIcon /> : <ViewTypeIcon icon={view.icon} />}
              </span>
              <span>{view.name}</span>
            </div>
            <span className="count">{view.count}</span>
          </div>
        ))}

      <div className="nav-item">
        <div className="nav-content">
          <img src={tagsIcon} alt="" width="16" height="16" className="item-icon" />
          <span>Tags</span>
        </div>
      </div>

      <div
        className="nav-item"
        onClick={() => setAllViewsInbox(inboxName)}
      >
        <div className="nav-content">
          <LayersIcon />
          <span>All Views</span>
        </div>
      </div>
    </div>
  );
};

  if (allViewsInbox) {
    return (
      <div className="side-nav-expanded">
        <AllViewsPanel
          inboxName={allViewsInbox}
          onBack={() => setAllViewsInbox(null)}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          viewsData={viewsByInbox[allViewsInbox]}
          onChange={(updated) =>
            setViewsByInbox((prev) => ({ ...prev, [allViewsInbox]: updated }))
          }
          activeRole={activeRole}
        />
      </div>
    );
  }

  return (
    <div className="side-nav-expanded">
      <div className="panel-header-top">
        <div className="header-row">
          <h1>Conversations</h1>
          <div className="header-actions">
            <img src={newConversationIcon} alt="New" width="16" height="16" />
          </div>
        </div>
        <div className="search-container">
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search conversations" />
          </div>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="section-title">Shared Inbox</div>
        
        <div className="nav-group">

          <div 
            className={`nav-item accordion-trigger ${expandedInboxes.support ? 'expanded' : ''}`}
            onClick={() => toggleInbox('support')}
          >
            <div className="nav-content">
              <img src={inboxIcon} alt="" width="16" height="16" className="item-icon" />
              <span>Support</span>
            </div>
            <img 
              src={sChevronDown} 
              alt="" 
              className={`chevron-icon ${expandedInboxes.support ? 'up' : ''}`} 
            />
          </div>

          {expandedInboxes.support && renderNestedItems('Support')}

          <div 
            className={`nav-item accordion-trigger ${expandedInboxes.finance ? 'expanded' : ''}`}
            onClick={() => toggleInbox('finance')}
          >
            <div className="nav-content">
              <img src={inboxIcon} alt="" width="16" height="16" className="item-icon" />
              <span>Finance</span>
            </div>
            <img 
              src={sChevronDown} 
              alt="" 
              className={`chevron-icon ${expandedInboxes.finance ? 'up' : ''}`} 
            />
          </div>

          {expandedInboxes.finance && renderNestedItems('Finance')}

          <div 
            className={`nav-item accordion-trigger ${expandedInboxes.shipping ? 'expanded' : ''}`}
            onClick={() => toggleInbox('shipping')}
          >
            <div className="nav-content">
              <img src={inboxIcon} alt="" width="16" height="16" className="item-icon" />
              <span>Shipping</span>
            </div>
            <img 
              src={sChevronDown} 
              alt="" 
              className={`chevron-icon ${expandedInboxes.shipping ? 'up' : ''}`} 
            />
          </div>

          {expandedInboxes.shipping && renderNestedItems('Shipping')}

          <div 
            className={`nav-item accordion-trigger ${expandedInboxes.refund ? 'expanded' : ''}`}
            onClick={() => toggleInbox('refund')}
          >
            <div className="nav-content">
              <img src={inboxIcon} alt="" width="16" height="16" className="item-icon" />
              <span>Refund</span>
            </div>
            <img 
              src={sChevronDown} 
              alt="" 
              className={`chevron-icon ${expandedInboxes.refund ? 'up' : ''}`} 
            />
          </div>

          {expandedInboxes.refund && renderNestedItems('Refund')}

          <div 
            className={`nav-item accordion-trigger ${expandedInboxes.itSupport ? 'expanded' : ''}`}
            onClick={() => toggleInbox('itSupport')}
          >
            <div className="nav-content">
              <img src={inboxIcon} alt="" width="16" height="16" className="item-icon" />
              <span>IT Support</span>
            </div>
            <img 
              src={sChevronDown} 
              alt="" 
              className={`chevron-icon ${expandedInboxes.itSupport ? 'up' : ''}`} 
            />
          </div>

          {expandedInboxes.itSupport && renderNestedItems('IT Support')}
        </div>

        <div className="section-title margin-top">More</div>
        
        <div className="nav-group">
          <div className="nav-item">
            <div className="nav-content">
              <img src={sentIcon} alt="" width="16" height="16" className="item-icon" />
              <span>Sent</span>
            </div>
            <span className="count">2</span>
          </div>

          <div className="nav-item">
            <div className="nav-content">
              <img src={draftIcon} alt="" width="16" height="16" className="item-icon" />
              <span>Draft</span>
            </div>
          </div>

          <div className="nav-item">
            <div className="nav-content">
              <img src={allMailIcon} alt="" width="16" height="16" className="item-icon" />
              <span>All Mail</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSidebarPanel;
