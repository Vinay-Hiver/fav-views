import React from 'react';
import AllViewsPanelOption1 from './AllViewsPanelOption1';
import { ViewTypeIcon, TeamFavouriteIcon } from '../components/viewIcons';
import { INITIAL_VIEWS_BY_INBOX } from '../data/dummyViews';

// Icons (identical assets to the live app's MainSidebarPanel)
import allMailIcon from '../assets/icons/all-mail.svg';
import draftIcon from '../assets/icons/draft.svg';
import newConversationIcon from '../assets/icons/new-conversation.svg';
import sentIcon from '../assets/icons/sent.svg';
import tagsIcon from '../assets/icons/tags.svg';
import sChevronDown from '../assets/icons/Read/side-bar-chevron.svg';

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="item-icon">
    <path d="M2 6L8.913 10.755C10.155 11.606 10.776 12.031 11.449 12.196C12.044 12.343 12.665 12.343 13.26 12.196C13.933 12.031 14.554 11.606 15.796 10.755L22 6M6.8 20H17.2C18.8802 20 19.7202 20 20.362 19.673C20.9265 19.3854 21.3854 18.9265 21.673 18.362C22 17.7202 22 16.8802 22 15.2V8.8C22 7.11984 22 6.27976 21.673 5.63803C21.3854 5.07354 20.9265 4.6146 20.362 4.32698C19.7202 4 18.8802 4 17.2 4H6.8C5.11984 4 4.27976 4 3.63803 4.32698C3.07354 4.6146 2.6146 5.07354 2.32698 5.63803C2 6.27976 2 7.11984 2 8.8V15.2C2 16.8802 2 17.7202 2.32698 18.362C2.6146 18.9265 3.07354 19.3854 3.63803 19.673C4.27976 20 5.11984 20 6.8 20Z"></path>
  </svg>
);

const LayersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="item-icon">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

// Same smooth height-measured expand/collapse as the live app.
const NestedGroup = ({ expanded, children }) => {
  const contentRef = React.useRef(null);
  const [height, setHeight] = React.useState(expanded ? 'auto' : 0);
  const isFirstRender = React.useRef(true);

  React.useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const el = contentRef.current;
    if (!el) return;

    if (expanded) {
      const target = el.scrollHeight;
      setHeight(target);
      const timeout = setTimeout(() => setHeight('auto'), 250);
      return () => clearTimeout(timeout);
    }

    setHeight(el.scrollHeight);
    requestAnimationFrame(() => setHeight(0));
  }, [expanded]);

  return (
    <div
      ref={contentRef}
      className="nav-group-nested-wrapper"
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        overflow: 'hidden',
        transition: 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  );
};

const MainSidebarPanelOption1 = ({ activeFilter, onFilterChange, activeRole }) => {
  const [expandedInboxes, setExpandedInboxes] = React.useState({
    support: true,
    finance: false,
    shipping: false,
    refund: false,
    itSupport: false,
  });

  const [allViewsInbox, setAllViewsInbox] = React.useState(null);
  const [viewsByInbox, setViewsByInbox] = React.useState(INITIAL_VIEWS_BY_INBOX);

  const toggleInbox = (inbox) => {
    setExpandedInboxes((prev) => ({ ...prev, [inbox]: !prev[inbox] }));
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
                {teamFavouriteIds.includes(view.id) ? <TeamFavouriteIcon /> : <ViewTypeIcon icon={view.icon} />}
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

        <div className="nav-item" onClick={() => setAllViewsInbox(inboxName)}>
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
        <AllViewsPanelOption1
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
              <MailIcon />
              <span>Support</span>
            </div>
            <img src={sChevronDown} alt="" className={`chevron-icon ${expandedInboxes.support ? 'up' : ''}`} />
          </div>
          <NestedGroup expanded={expandedInboxes.support}>{renderNestedItems('Support')}</NestedGroup>

          <div
            className={`nav-item accordion-trigger ${expandedInboxes.finance ? 'expanded' : ''}`}
            onClick={() => toggleInbox('finance')}
          >
            <div className="nav-content">
              <MailIcon />
              <span>Finance</span>
            </div>
            <img src={sChevronDown} alt="" className={`chevron-icon ${expandedInboxes.finance ? 'up' : ''}`} />
          </div>
          <NestedGroup expanded={expandedInboxes.finance}>{renderNestedItems('Finance')}</NestedGroup>

          <div
            className={`nav-item accordion-trigger ${expandedInboxes.shipping ? 'expanded' : ''}`}
            onClick={() => toggleInbox('shipping')}
          >
            <div className="nav-content">
              <MailIcon />
              <span>Shipping</span>
            </div>
            <img src={sChevronDown} alt="" className={`chevron-icon ${expandedInboxes.shipping ? 'up' : ''}`} />
          </div>
          <NestedGroup expanded={expandedInboxes.shipping}>{renderNestedItems('Shipping')}</NestedGroup>

          <div
            className={`nav-item accordion-trigger ${expandedInboxes.refund ? 'expanded' : ''}`}
            onClick={() => toggleInbox('refund')}
          >
            <div className="nav-content">
              <MailIcon />
              <span>Refund</span>
            </div>
            <img src={sChevronDown} alt="" className={`chevron-icon ${expandedInboxes.refund ? 'up' : ''}`} />
          </div>
          <NestedGroup expanded={expandedInboxes.refund}>{renderNestedItems('Refund')}</NestedGroup>

          <div
            className={`nav-item accordion-trigger ${expandedInboxes.itSupport ? 'expanded' : ''}`}
            onClick={() => toggleInbox('itSupport')}
          >
            <div className="nav-content">
              <MailIcon />
              <span>IT Support</span>
            </div>
            <img src={sChevronDown} alt="" className={`chevron-icon ${expandedInboxes.itSupport ? 'up' : ''}`} />
          </div>
          <NestedGroup expanded={expandedInboxes.itSupport}>{renderNestedItems('IT Support')}</NestedGroup>
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

export default MainSidebarPanelOption1;
