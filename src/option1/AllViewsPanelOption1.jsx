import React from 'react';
import { createPortal } from 'react-dom';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MAX_FAVOURITES } from '../data/dummyViews';
import './option1.css';
import {
  BackIcon, SearchIcon, StarIcon, DragHandleIcon, ViewTypeIcon, KebabIcon,
  UsersStarIcon, TeamFavouriteIcon, RenameIcon, PencilIcon, TrashIcon,
} from '../components/viewIcons';

// Option 1 spec — deliberately simpler than the live app's AllViewsPanel:
//   - Only two sections: "Favourites" (personal stars) and "All Views".
//   - Marking a view a Team Favourite ONLY swaps its row icon to the
//     star-in-square glyph, rendered in the same colour as any other row
//     icon (no separate indicator, no role-based colour, no re-sectioning).
//   - Every view — favourited or not, team-pinned or not — always gets the
//     same personal star on hover, adding/removing it from Favourites.
//   - The kebab (Admin only) has a single action: Add/Remove Team Favourite.
//   - Favourites reordering is powered by @dnd-kit — pointer-based drag with
//     built-in physics-y reorder animation, instead of the raw HTML5 DnD +
//     manual FLIP the live app uses.
const AllViewsPanelOption1 = ({ inboxName, onBack, activeFilter, onFilterChange, viewsData, onChange, activeRole }) => {
  const [search, setSearch] = React.useState('');
  const [menuOpenFor, setMenuOpenFor] = React.useState(null);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });
  const [starTooltipFor, setStarTooltipFor] = React.useState(null);
  const [starTooltipPosition, setStarTooltipPosition] = React.useState({ top: 0, left: 0 });
  const [teamFavTooltipFor, setTeamFavTooltipFor] = React.useState(null);
  const [teamFavTooltipPosition, setTeamFavTooltipPosition] = React.useState({ top: 0, left: 0 });
  const [activeDragId, setActiveDragId] = React.useState(null);

  const views = viewsData?.views || [];
  const favouriteIdsByRole = viewsData?.favouriteIds || {};
  const favouriteIds = favouriteIdsByRole[activeRole] || [];
  const teamFavouriteIds = viewsData?.teamFavouriteIds || [];

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  if (!viewsData) return null;

  const toggleFavourite = (id) => {
    const isFavourited = favouriteIds.includes(id);
    if (!isFavourited && favouriteIds.length >= MAX_FAVOURITES) return;
    const nextFavouriteIds = isFavourited
      ? favouriteIds.filter((favId) => favId !== id)
      : [...favouriteIds, id];
    onChange({ ...viewsData, favouriteIds: { ...favouriteIdsByRole, [activeRole]: nextFavouriteIds } });
  };

  const handleDragStart = (event) => setActiveDragId(event.active.id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over || active.id === over.id) return;
    const fromIndex = favouriteIds.indexOf(active.id);
    const toIndex = favouriteIds.indexOf(over.id);
    if (fromIndex === -1 || toIndex === -1) return;
    const next = arrayMove(favouriteIds, fromIndex, toIndex);
    onChange({ ...viewsData, favouriteIds: { ...favouriteIdsByRole, [activeRole]: next } });
  };

  const toggleTeamFavourite = (id) => {
    const isTeamFavourited = teamFavouriteIds.includes(id);
    const nextTeamFavouriteIds = isTeamFavourited
      ? teamFavouriteIds.filter((favId) => favId !== id)
      : [...teamFavouriteIds, id];
    onChange({ ...viewsData, teamFavouriteIds: nextTeamFavouriteIds });
    setMenuOpenFor(null);
  };

  const query = search.toLowerCase();
  const favourites = favouriteIds
    .map((id) => viewsById[id])
    .filter((v) => v && v.name.toLowerCase().includes(query));
  // All Views ordering: predefined (system) views always come first, in
  // their fixed data order (Mine, Unassigned, Team, Tickets, Pending,
  // Closed) regardless of team-fav status — only their icon changes.
  // Everything else is alphabetical, with team favourites pinned above
  // the rest (still alphabetical within each group).
  const eligible = views.filter(
    (v) => !favouriteIds.includes(v.id) && v.name.toLowerCase().includes(query)
  );
  const systemOthers = eligible.filter((v) => v.type === 'system');
  const customOthers = eligible
    .filter((v) => v.type !== 'system')
    .sort((a, b) => {
      const aTeamFav = teamFavouriteIds.includes(a.id);
      const bTeamFav = teamFavouriteIds.includes(b.id);
      if (aTeamFav !== bTeamFav) return aTeamFav ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  const others = [...systemOthers, ...customOthers];

  const isSelected = (view) =>
    activeFilter?.inbox === inboxName && activeFilter?.type === view.name;

  const starTooltip = (view) => {
    if (favouriteIds.includes(view.id)) return 'Remove from favorites';
    if (favouriteIds.length >= MAX_FAVOURITES) return 'You can add up to 5 favorites';
    return 'Add to favorites';
  };

  // The only visual effect of a Team Favourite: swap the leading icon.
  // TeamFavouriteIcon already uses fill="currentColor", so it automatically
  // takes on whatever colour the row/selected state gives any other icon.
  const rowIcon = (view) =>
    teamFavouriteIds.includes(view.id) ? <TeamFavouriteIcon /> : <ViewTypeIcon icon={view.icon} />;

  // Hover handlers for the team-favourite row icon, shown only once a view
  // is marked as a team favourite — mirrors the live app's tooltip copy.
  const teamFavIconHoverProps = (view) => ({
    onMouseEnter: (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setTeamFavTooltipPosition({ top: rect.top + rect.height / 2, left: rect.right + 6 });
      setTeamFavTooltipFor(view.id);
    },
    onMouseLeave: () => setTeamFavTooltipFor(null),
  });

  // Shared row body (icon, name, star, kebab/count) — used by both the
  // plain "All Views" rows and the sortable "Favourites" rows below.
  const renderRowBody = (view, { dragHandleProps } = {}) => (
    <>
      <div className="view-row-main">
        <span className="view-row-icon">
          {dragHandleProps ? (
            <>
              <span
                className="icon-default"
                {...(teamFavouriteIds.includes(view.id) ? teamFavIconHoverProps(view) : {})}
              >
                {rowIcon(view)}
              </span>
              <span className="icon-drag-handle" {...dragHandleProps}>
                <DragHandleIcon />
              </span>
            </>
          ) : teamFavouriteIds.includes(view.id) ? (
            <span className="icon-team-fav-static" {...teamFavIconHoverProps(view)}>
              {rowIcon(view)}
            </span>
          ) : (
            rowIcon(view)
          )}
          {teamFavTooltipFor === view.id &&
            createPortal(
              <span
                className={`view-star-tooltip view-star-tooltip-right ${activeRole === 'Agent' ? 'view-star-tooltip-multiline' : ''}`}
                style={{ top: teamFavTooltipPosition.top, left: teamFavTooltipPosition.left }}
              >
                {activeRole === 'Agent' ? (
                  <>
                    <span>View marked as team favorite</span>
                    <span>by your admin</span>
                  </>
                ) : (
                  'Marked as team favorite'
                )}
              </span>,
              document.body
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
        {activeRole === 'Admin' ? (
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
                  <button
                    type="button"
                    className="view-kebab-menu-item view-kebab-menu-item-subtitled"
                    onClick={() => toggleTeamFavourite(view.id)}
                  >
                    <UsersStarIcon />
                    <span className="view-kebab-menu-item-text">
                      <span className="view-kebab-menu-item-label">
                        {teamFavouriteIds.includes(view.id) ? 'Remove from team favourites' : 'Add to team favourites'}
                      </span>
                      <span className="view-kebab-menu-item-subtitle">
                        {teamFavouriteIds.includes(view.id)
                          ? 'Remove this view from your agents’ sidebar'
                          : 'Add this view to your agents’ sidebar'}
                      </span>
                    </span>
                  </button>
                  {view.type === 'custom' && (
                    <>
                      <div className="view-kebab-menu-divider" />
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
                    </>
                  )}
                </div>,
                document.body
              )}
          </div>
        ) : (
          <span className="view-row-count">{view.count}</span>
        )}
      </div>
    </>
  );

  const renderRow = (view) => (
    <div
      className={`view-row ${isSelected(view) ? 'selected' : ''}`}
      key={view.id}
      onClick={() => onFilterChange?.({ inbox: inboxName, type: view.name })}
    >
      {renderRowBody(view)}
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={favouriteIds} strategy={verticalListSortingStrategy}>
            <div className="nav-group view-list">
              {favourites.length > 0 ? (
                favourites.map((view) => (
                  <SortableFavouriteRow
                    key={view.id}
                    view={view}
                    isSelected={isSelected(view)}
                    onSelect={() => onFilterChange?.({ inbox: inboxName, type: view.name })}
                    renderRowBody={renderRowBody}
                  />
                ))
              ) : (
                <div className="view-list-empty">There are no favourite views.</div>
              )}
            </div>
          </SortableContext>
          {createPortal(
            <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
              {activeDragId && viewsById[activeDragId] ? (
                <div className="view-row draggable-row drag-overlay-row">
                  {renderRowBody(viewsById[activeDragId])}
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>

        <div className="view-list-divider" />

        <div className="section-title margin-top">All Views</div>
        <div className="nav-group view-list">
          {others.map((view) => renderRow(view))}
        </div>
      </div>
    </div>
  );
};

// One Favourites row, made sortable by @dnd-kit — the drag handle (six dots,
// shown on hover in place of the row's normal icon) is the only element the
// pointer/keyboard listeners attach to, so clicking the rest of the row
// still just selects the view.
const SortableFavouriteRow = ({ view, isSelected, onSelect, renderRowBody }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: view.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`view-row draggable-row ${isSelected ? 'selected' : ''} ${isDragging ? 'is-dragging' : ''}`}
      onClick={onSelect}
    >
      {renderRowBody(view, { dragHandleProps: { ...attributes, ...listeners } })}
    </div>
  );
};

export default AllViewsPanelOption1;
