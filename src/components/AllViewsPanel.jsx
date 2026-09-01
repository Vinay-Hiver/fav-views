import React from 'react';
import { createPortal } from 'react-dom';
import { MAX_FAVOURITES } from '../data/dummyViews';
import {
  BackIcon, SearchIcon, StarIcon, DragHandleIcon, ViewTypeIcon, KebabIcon,
  UsersStarIcon, RenameIcon, PencilIcon, TrashIcon, HeartCircleIcon,
} from './viewIcons';

// 1x1 transparent image used to suppress the browser's native drag ghost.
const EMPTY_DRAG_IMAGE = typeof Image !== 'undefined' ? new Image() : null;
if (EMPTY_DRAG_IMAGE) {
  EMPTY_DRAG_IMAGE.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7';
}

// `viewsData` = { views: [...], favouriteIds: [...] } for the current inbox.
// This component is fully controlled — all favourite/reorder changes are
// reported up via onChange so the home nav (favourite views) stays in sync.
const AllViewsPanel = ({ inboxName, onBack, activeFilter, onFilterChange, viewsData, onChange, activeRole }) => {
  const [search, setSearch] = React.useState('');
  const [draggedId, setDraggedId] = React.useState(null);
  const [menuOpenFor, setMenuOpenFor] = React.useState(null);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });
  const [starTooltipFor, setStarTooltipFor] = React.useState(null);
  const [starTooltipPosition, setStarTooltipPosition] = React.useState({ top: 0, left: 0 });

  const views = viewsData?.views || [];
  // Admin and Agent each have their own personal Favourites for this inbox.
  const favouriteIdsByRole = viewsData?.favouriteIds || {};
  const favouriteIds = favouriteIdsByRole[activeRole] || [];
  const teamFavouriteIds = viewsData?.teamFavouriteIds || [];

  // Close the kebab menu on any click outside of it.
  const menuRef = React.useRef(null);
  React.useEffect(() => {
    if (!menuOpenFor) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenFor(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenFor]);

  const viewsById = React.useMemo(() => {
    const map = {};
    views.forEach((v) => { map[v.id] = v; });
    return map;
  }, [views]);

  // FLIP: whenever the favourites order changes, slide rows from their old
  // position to their new one instead of letting them jump — the "other
  // cards move out of the way" feel of a basic reorderable list.
  const rowRefs = React.useRef({});
  const prevRectsRef = React.useRef({});
  React.useLayoutEffect(() => {
    const nextRects = {};
    favouriteIds.forEach((id) => {
      const el = rowRefs.current[id];
      if (el) nextRects[id] = el.getBoundingClientRect();
    });
    favouriteIds.forEach((id) => {
      const prev = prevRectsRef.current[id];
      const next = nextRects[id];
      const el = rowRefs.current[id];
      if (!prev || !next || !el) return;
      const deltaY = prev.top - next.top;
      if (deltaY) {
        el.style.transition = 'none';
        el.style.transform = `translateY(${deltaY}px)`;
        // Force layout so the browser commits the offset above before we
        // flip the transition back on — otherwise it can coalesce both
        // style writes into one frame and the move never animates.
        // eslint-disable-next-line no-unused-expressions
        el.offsetHeight;
        el.style.transition = 'transform 220ms ease';
        el.style.transform = '';
      }
    });
    prevRectsRef.current = nextRects;
  }, [favouriteIds.join('|')]);

  if (!viewsData) return null;

  const toggleFavourite = (id) => {
    const isFavourited = favouriteIds.includes(id);
    // At the cap, clicking an unfavourited star is a no-op — the hover
    // tooltip already explains why, nothing else needs to happen.
    if (!isFavourited && favouriteIds.length >= MAX_FAVOURITES) return;
    const nextFavouriteIds = isFavourited
      ? favouriteIds.filter((favId) => favId !== id)
      : [...favouriteIds, id];
    onChange({
      views,
      favouriteIds: { ...favouriteIdsByRole, [activeRole]: nextFavouriteIds },
      teamFavouriteIds,
    });
  };

  // Admin-only: move a view between "All Views" and "Team Favourites".
  // Capped at MAX_FAVOURITES too — same limit as personal favourites.
  const toggleTeamFavourite = (id) => {
    const isTeamFavourited = teamFavouriteIds.includes(id);
    if (!isTeamFavourited && teamFavouriteIds.length >= MAX_FAVOURITES) return;
    const nextTeamFavouriteIds = isTeamFavourited
      ? teamFavouriteIds.filter((favId) => favId !== id)
      : [...teamFavouriteIds, id];
    onChange({ views, favouriteIds: favouriteIdsByRole, teamFavouriteIds: nextTeamFavouriteIds });
    setMenuOpenFor(null);
  };

  // Live-reorders while dragging over another favourite row: dropping the
  // dragged card before/after the hovered row (based on cursor position),
  // so the other rows slide out of the way as you move — no separate drop
  // target needed.
  const reorderOverRow = (draggedViewId, targetViewId, placeAfter) => {
    if (draggedViewId === targetViewId) return;
    const fromIndex = favouriteIds.indexOf(draggedViewId);
    let toIndex = favouriteIds.indexOf(targetViewId);
    if (fromIndex === -1 || toIndex === -1) return;
    if (placeAfter) toIndex += 1;
    if (fromIndex < toIndex) toIndex -= 1;
    if (fromIndex === toIndex) return;
    const next = [...favouriteIds];
    next.splice(fromIndex, 1);
    next.splice(toIndex, 0, draggedViewId);
    onChange({
      views,
      favouriteIds: { ...favouriteIdsByRole, [activeRole]: next },
      teamFavouriteIds,
    });
  };

  const query = search.toLowerCase();
  const favourites = favouriteIds
    .map((id) => viewsById[id])
    .filter((v) => v && v.name.toLowerCase().includes(query));
  // A view that's both team- and personally-favourited only shows once, in
  // Favourites — Team Favourites is where it "lives" until someone stars it.
  const teamFavourites = teamFavouriteIds
    .map((id) => viewsById[id])
    .filter((v) => v && !favouriteIds.includes(v.id) && v.name.toLowerCase().includes(query));
  const others = views.filter(
    (v) => !favouriteIds.includes(v.id) && !teamFavouriteIds.includes(v.id) && v.name.toLowerCase().includes(query)
  );

  const isSelected = (view) =>
    activeFilter?.inbox === inboxName && activeFilter?.type === view.name;

  const canDrag = search.trim() === '';

  // A view that's a Team Favourite always shows the heart-circle icon, even
  // after someone also personally favourites it and it moves up into the
  // Favourites list — it stays team-pinned either way.
  const rowIcon = (view) =>
    teamFavouriteIds.includes(view.id) ? <HeartCircleIcon /> : <ViewTypeIcon icon={view.icon} />;

  const starTooltip = (view) => {
    if (favouriteIds.includes(view.id)) return 'Remove from favorites';
    if (favouriteIds.length >= MAX_FAVOURITES) return 'You can add up to 5 favorites';
    return 'Add to favorites';
  };

  const renderRow = (view, { draggable = false } = {}) => (
    <div
      className={`view-row ${isSelected(view) ? 'selected' : ''} ${draggable ? 'draggable-row' : ''} ${draggedId === view.id ? 'is-dragging' : ''}`}
      key={view.id}
      ref={draggable ? (el) => { rowRefs.current[view.id] = el; } : undefined}
      onClick={() => onFilterChange?.({ inbox: inboxName, type: view.name })}
      onDragOver={(e) => {
        if (!draggable || !canDrag || !draggedId || draggedId === view.id) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const placeAfter = e.clientY > rect.top + rect.height / 2;
        reorderOverRow(draggedId, view.id, placeAfter);
      }}
      onDrop={(e) => {
        if (!draggable) return;
        e.preventDefault();
        setDraggedId(null);
      }}
    >
      <div className="view-row-main">
        <span className="view-row-icon">
          {draggable ? (
            <>
              <span className="icon-default">{rowIcon(view)}</span>
              <span
                className="icon-drag-handle"
                draggable={canDrag}
                onDragStart={(e) => {
                  if (!canDrag) return;
                  e.stopPropagation();
                  // Suppress the native ghost preview entirely — reordering
                  // is shown purely by the rows sliding into place.
                  e.dataTransfer.setDragImage(EMPTY_DRAG_IMAGE, 0, 0);
                  setDraggedId(view.id);
                }}
                onDragEnd={() => setDraggedId(null)}
              >
                <DragHandleIcon />
              </span>
            </>
          ) : (
            rowIcon(view)
          )}
        </span>
        <span className="view-row-name">{view.name}</span>
      </div>
      <div className="view-row-meta">
        <span
          className="view-star-wrap"
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setStarTooltipPosition({ top: rect.top - 6, left: rect.left + rect.width / 2 });
            setStarTooltipFor(view.id);
          }}
          onMouseLeave={() => setStarTooltipFor(null)}
        >
          <button
            type="button"
            className="view-star-btn"
            disabled={!favouriteIds.includes(view.id) && favouriteIds.length >= MAX_FAVOURITES}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavourite(view.id);
            }}
            aria-label={favouriteIds.includes(view.id) ? 'Remove from favourites' : 'Add to favourites'}
          >
            <StarIcon filled={favouriteIds.includes(view.id)} />
          </button>
          {starTooltipFor === view.id &&
            createPortal(
              <span
                className="view-star-tooltip"
                style={{ top: starTooltipPosition.top, left: starTooltipPosition.left }}
              >
                {starTooltip(view)}
              </span>,
              document.body
            )}
        </span>
        {view.type === 'custom' && (activeRole === 'Admin' || !teamFavouriteIds.includes(view.id)) ? (
          <div className="view-kebab-wrap">
            <span className="view-row-count-under">{view.count}</span>
            <button
              type="button"
              className={`view-kebab-btn ${menuOpenFor === view.id ? 'menu-open' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (menuOpenFor === view.id) {
                  setMenuOpenFor(null);
                  return;
                }
                const rect = e.currentTarget.getBoundingClientRect();
                setMenuPosition({ top: rect.top - 6, left: rect.right + 6 });
                setMenuOpenFor(view.id);
              }}
              aria-label="View options"
            >
              <span className="view-kebab-btn-inner"><KebabIcon /></span>
            </button>
            {menuOpenFor === view.id &&
              createPortal(
                <div
                  className="view-kebab-menu"
                  style={{ top: menuPosition.top, left: menuPosition.left }}
                  ref={menuRef}
                  onClick={(e) => e.stopPropagation()}
                >
                  {activeRole === 'Admin' && (() => {
                    const isTeamFavourited = teamFavouriteIds.includes(view.id);
                    const isTeamCapped = !isTeamFavourited && teamFavouriteIds.length >= MAX_FAVOURITES;
                    return (
                      <>
                        <button
                          type="button"
                          className={`view-kebab-menu-item view-kebab-menu-item-subtitled ${isTeamCapped ? 'view-kebab-menu-item-disabled' : ''}`}
                          disabled={isTeamCapped}
                          onClick={() => toggleTeamFavourite(view.id)}
                        >
                          <UsersStarIcon />
                          <span className="view-kebab-menu-item-text">
                            <span className="view-kebab-menu-item-label">
                              {isTeamFavourited ? 'Remove from team favourites' : 'Add to team favourites'}
                            </span>
                            <span className={`view-kebab-menu-item-subtitle ${isTeamCapped ? 'view-kebab-menu-item-subtitle-warning' : ''}`}>
                              {isTeamCapped
                                ? 'You can add up to 5 team favourites'
                                : isTeamFavourited
                                ? 'Remove this view from your agents’ sidebar'
                                : 'Add this view to your agents’ sidebar'}
                            </span>
                          </span>
                        </button>
                        <div className="view-kebab-menu-divider" />
                      </>
                    );
                  })()}
                  <button type="button" className="view-kebab-menu-item" onClick={() => setMenuOpenFor(null)}>
                    <RenameIcon />
                    <span>Rename View</span>
                  </button>
                  <button type="button" className="view-kebab-menu-item" onClick={() => setMenuOpenFor(null)}>
                    <PencilIcon />
                    <span>Edit View</span>
                  </button>
                  <button type="button" className="view-kebab-menu-item" onClick={() => setMenuOpenFor(null)}>
                    <TrashIcon />
                    <span>Delete View</span>
                  </button>
                </div>,
                document.body
              )}
          </div>
        ) : (
          <span className="view-row-count">{view.count}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="all-views-panel">
      <div className="panel-header-top">
        <div className="header-row">
          <button type="button" className="back-btn" onClick={onBack}>
            <BackIcon />
            <span>Conversations</span>
          </button>
        </div>
        <div className="all-views-breadcrumb">{inboxName} / <strong>All Views</strong></div>
      </div>

      <div className="sidebar-content all-views-content">
        <div className="search-container">
          <div className="search-box">
            <SearchIcon />
            <input
              type="text"
              placeholder="Find Views"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="section-title margin-top">Favourites</div>
        <div className="nav-group view-list">
          {favourites.length > 0 ? (
            favourites.map((view) => renderRow(view, { draggable: true }))
          ) : (
            <div className="view-list-empty">No favourites yet — star a view below</div>
          )}
        </div>

        {/* No empty state here at all — Team Favourites only ever appears
            once there's actually something in it to show. */}
        {teamFavourites.length > 0 && (
          <div className="nav-group view-list">
            {teamFavourites.map((view) => renderRow(view))}
          </div>
        )}

        <div className="view-list-divider" />

        <div className="section-title margin-top">All Views</div>
        <div className="nav-group view-list">
          {others.map((view) => renderRow(view))}
        </div>
      </div>
    </div>
  );
};

export default AllViewsPanel;
