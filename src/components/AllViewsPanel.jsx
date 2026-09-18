import React from 'react';
import { createPortal } from 'react-dom';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MAX_FAVOURITES } from '../data/dummyViews';
import {
  BackIcon, SearchIcon, StarIcon, DragHandleIcon, ViewTypeIcon, KebabIcon,
  UsersStarIcon, RenameIcon, PencilIcon, TrashIcon, InfoIcon,
} from './viewIcons';

// `viewsData` = { views: [...], favouriteIds: [...] } for the current inbox.
// This component is fully controlled — all favourite/reorder changes are
// reported up via onChange so the home nav (favourite views) stays in sync.
// Drag-and-drop reordering is powered by @dnd-kit — same library used by the
// earlier option prototypes.
const AllViewsPanel = ({ inboxName, onBack, activeFilter, onFilterChange, viewsData, onChange, activeRole }) => {
  const [search, setSearch] = React.useState('');
  const [menuOpenFor, setMenuOpenFor] = React.useState(null);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });
  const [starTooltipFor, setStarTooltipFor] = React.useState(null);
  const [starTooltipPosition, setStarTooltipPosition] = React.useState({ top: 0, left: 0 });
  const [favInfoTooltip, setFavInfoTooltip] = React.useState(false);
  const [favInfoPosition, setFavInfoPosition] = React.useState({ top: 0, left: 0 });
  const [activeDragId, setActiveDragId] = React.useState(null);

  const views = viewsData?.views || [];
  // Admin and Agent each have their own personal Favourites for this inbox.
  const favouriteIdsByRole = viewsData?.favouriteIds || {};
  const favouriteIds = favouriteIdsByRole[activeRole] || [];
  const teamFavouriteIds = viewsData?.teamFavouriteIds || [];
  // The single merged, drag-reorderable order of personal + Team Favourites
  // for this role — see the comment in data/dummyViews.js.
  const sidebarOrderByRole = viewsData?.sidebarOrder || {};
  const sidebarOrder = sidebarOrderByRole[activeRole] || favouriteIds;

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  if (!viewsData) return null;

  // Default insertion point for a newly personal-favourited view: right
  // before the first Team Favourite in the order, so personal favourites
  // stay grouped above Team Favourites by default (bumping any Team
  // Favourites down a slot) — without disturbing anyone's own manual
  // drag-reorder among either group. Only used for *new* entries; once
  // something's in the list, dragging it anywhere is entirely up to
  // whoever owns that sidebar.
  const insertBeforePersonalTeamBoundary = (order, id, teamIds) => {
    const withoutId = order.filter((favId) => favId !== id);
    const firstTeamIndex = withoutId.findIndex((favId) => teamIds.includes(favId));
    if (firstTeamIndex === -1) return [...withoutId, id];
    const next = [...withoutId];
    next.splice(firstTeamIndex, 0, id);
    return next;
  };

  const toggleFavourite = (id) => {
    const isFavourited = favouriteIds.includes(id);
    // At the cap, clicking an unfavourited star is a no-op — the hover
    // tooltip already explains why, nothing else needs to happen.
    if (!isFavourited && favouriteIds.length >= MAX_FAVOURITES) return;
    const nextFavouriteIds = isFavourited
      ? favouriteIds.filter((favId) => favId !== id)
      : [...favouriteIds, id];
    const nextOrder = isFavourited
      ? sidebarOrder.filter((favId) => favId !== id)
      : sidebarOrder.includes(id) ? sidebarOrder : insertBeforePersonalTeamBoundary(sidebarOrder, id, teamFavouriteIds);
    onChange({
      views,
      favouriteIds: { ...favouriteIdsByRole, [activeRole]: nextFavouriteIds },
      sidebarOrder: { ...sidebarOrderByRole, [activeRole]: nextOrder },
      teamFavouriteIds,
    });
  };

  // Admin-only: move a view between "All Views" and "Team Favourites".
  // Capped at MAX_FAVOURITES too — same limit as personal favourites. A
  // Team Favourite is shared across every role, so it's added to (or
  // removed from) both roles' sidebarOrder at once.
  const toggleTeamFavourite = (id) => {
    const isTeamFavourited = teamFavouriteIds.includes(id);
    if (!isTeamFavourited && teamFavouriteIds.length >= MAX_FAVOURITES) return;
    const nextTeamFavouriteIds = isTeamFavourited
      ? teamFavouriteIds.filter((favId) => favId !== id)
      : [...teamFavouriteIds, id];
    const nextFavouriteIdsByRole = { ...favouriteIdsByRole };
    const nextSidebarOrder = { ...sidebarOrderByRole };
    ['Admin', 'Agent'].forEach((role) => {
      const roleOrder = sidebarOrderByRole[role] || favouriteIdsByRole[role] || [];
      if (isTeamFavourited) {
        // Removing it as a Team Favourite — the reverse of the personal ->
        // team conversion above. Anyone who currently has it in their
        // sidebar (because it was a Team Favourite) keeps it there; it
        // just converts into their own personal favourite instead of
        // disappearing, as long as they're under their personal cap.
        const roleFavs = favouriteIdsByRole[role] || [];
        const convertsToPersonal = !roleFavs.includes(id) && roleFavs.length < MAX_FAVOURITES;
        nextFavouriteIdsByRole[role] = convertsToPersonal ? [...roleFavs, id] : roleFavs;
        // If it converted into a personal favourite, it moves up to sit
        // with the other personal favourites instead of staying down in
        // the Team Favourites block it's leaving.
        nextSidebarOrder[role] = convertsToPersonal
          ? insertBeforePersonalTeamBoundary(roleOrder, id, nextTeamFavouriteIds)
          : roleOrder;
      } else {
        // Newly a Team Favourite — it always lands at the bottom of the
        // sidebar. If it was already someone's personal favourite, that
        // star is now redundant (it's pinned for everyone anyway), so it
        // simply converts into a Team Favourite instead of double-counting.
        nextFavouriteIdsByRole[role] = (favouriteIdsByRole[role] || []).filter((favId) => favId !== id);
        nextSidebarOrder[role] = [...roleOrder.filter((favId) => favId !== id), id];
      }
    });
    onChange({
      views,
      favouriteIds: nextFavouriteIdsByRole,
      sidebarOrder: nextSidebarOrder,
      teamFavouriteIds: nextTeamFavouriteIds,
    });
    setMenuOpenFor(null);
  };

  const handleDragStart = (event) => setActiveDragId(event.active.id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over || active.id === over.id) return;
    const fromIndex = sidebarOrder.indexOf(active.id);
    const toIndex = sidebarOrder.indexOf(over.id);
    if (fromIndex === -1 || toIndex === -1) return;
    const next = arrayMove(sidebarOrder, fromIndex, toIndex);
    onChange({
      views,
      favouriteIds: favouriteIdsByRole,
      sidebarOrder: { ...sidebarOrderByRole, [activeRole]: next },
      teamFavouriteIds,
    });
  };

  const query = search.toLowerCase();
  // One merged, drag-reorderable list — personal favourites and Team
  // Favourites interleaved freely in whatever order the user's arranged
  // them. All of it shows in the home nav (up to 5 personal + 5 team = 10).
  const mergedFavourites = sidebarOrder
    .map((id) => viewsById[id])
    .filter((v) => v && v.name.toLowerCase().includes(query));
  const others = views.filter(
    (v) => !favouriteIds.includes(v.id) && !teamFavouriteIds.includes(v.id) && v.name.toLowerCase().includes(query)
  );

  const isSelected = (view) =>
    activeFilter?.inbox === inboxName && activeFilter?.type === view.name;

  // A Team Favourite keeps its own view-type icon — the star badge next to
  // the kebab is what signals team-favourite status, not the row icon.
  const rowIcon = (view) => <ViewTypeIcon icon={view.icon} />;

  const starTooltip = (view) => {
    if (favouriteIds.includes(view.id)) return 'Remove from favorites';
    if (favouriteIds.length >= MAX_FAVOURITES) return 'You can add up to 5 favorites';
    return 'Add to favorites';
  };

  // Shared row body (icon, name, star/team-fav, kebab) — used by both the
  // draggable Favourites rows and the plain All Views rows.
  const renderRowBody = (view, { dragHandleProps } = {}) => (
    <>
      <div className="view-row-main">
        <span className="view-row-icon">
          {dragHandleProps ? (
            <>
              <span className="icon-default">{rowIcon(view)}</span>
              <span className="icon-drag-handle" {...dragHandleProps}>
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
        {teamFavouriteIds.includes(view.id) ? (
          // Team Favourites are pinned by the Admin and can't be personally
          // starred/unstarred by an Agent, so no star toggle here at all —
          // just the indicator marking it as team-pinned.
          <span
            className="view-team-fav-indicator agent-variant"
            aria-label="Team favourite"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setStarTooltipPosition({ top: rect.top - 6, left: rect.left + rect.width / 2 });
              setStarTooltipFor(view.id);
            }}
            onMouseLeave={() => setStarTooltipFor(null)}
          >
            <StarIcon filled />
            {starTooltipFor === view.id &&
              createPortal(
                <span
                  className={`view-star-tooltip ${activeRole === 'Agent' ? 'view-star-tooltip-multiline' : ''}`}
                  style={{ top: starTooltipPosition.top, left: starTooltipPosition.left }}
                >
                  {activeRole === 'Agent' ? (
                    <>
                      <span>View favourited by your admin.</span>
                      <span>Only they can remove it.</span>
                    </>
                  ) : (
                    'Marked as team favorite'
                  )}
                </span>,
                document.body
              )}
          </span>
        ) : (
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
                setStarTooltipFor(null);
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
        )}
        {view.id !== 'mine' && (view.type === 'custom'
          ? activeRole === 'Admin' || !teamFavouriteIds.includes(view.id)
          // Predefined (system) views other than "Mine" can still be
          // marked a Team Favourite — but the only thing they offer is
          // that toggle, and only to the Admin (no Rename/Edit/Delete).
          : activeRole === 'Admin'
        ) ? (
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
                        {view.type === 'custom' && <div className="view-kebab-menu-divider" />}
                      </>
                    );
                  })()}
                  {view.type === 'custom' && (
                    <>
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

  const renderPlainRow = (view) => (
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

        <div className="section-title margin-top section-title-with-info">
          <span>My Favorites</span>
          <span
            className="section-title-info-icon"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setFavInfoPosition({ top: rect.top - 6, left: rect.left + rect.width / 2 });
              setFavInfoTooltip(true);
            }}
            onMouseLeave={() => setFavInfoTooltip(false)}
          >
            <InfoIcon />
          </span>
          {favInfoTooltip &&
            createPortal(
              <span
                className="view-star-tooltip view-star-tooltip-multiline"
                style={{ top: favInfoPosition.top, left: favInfoPosition.left }}
              >
                <span>These views will appear</span>
                <span>on your sidebar</span>
              </span>,
              document.body
            )}
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sidebarOrder} strategy={verticalListSortingStrategy}>
            <div className="nav-group view-list">
              {mergedFavourites.length > 0 ? (
                mergedFavourites.map((view) => (
                  <SortableRow key={view.id} view={view} isSelected={isSelected(view)} onSelect={() => onFilterChange?.({ inbox: inboxName, type: view.name })} renderRowBody={renderRowBody} />
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
          {others.map((view) => renderPlainRow(view))}
        </div>
      </div>
    </div>
  );
};

// One draggable row within My Favorites — the drag handle (six dots, shown
// on hover in place of the row's normal icon) is the only element the
// pointer/keyboard listeners attach to, so clicking the rest of the row
// still just selects the view.
const SortableRow = ({ view, isSelected, onSelect, renderRowBody }) => {
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

export default AllViewsPanel;
