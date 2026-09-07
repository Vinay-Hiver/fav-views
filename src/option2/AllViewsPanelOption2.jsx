import React from 'react';
import { createPortal } from 'react-dom';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MAX_FAVOURITES } from '../data/dummyViews';
import './option2.css';
import {
  BackIcon, SearchIcon, StarIcon, DragHandleIcon, ViewTypeIcon, KebabIcon,
  UsersStarIcon, RenameIcon, PencilIcon, TrashIcon, HeartCircleIcon, TeamFavRowIcon,
} from '../components/viewIcons';

// `viewsData` = { views, favouriteIds, teamFavouriteIds, sidebarOrder,
// favouritesOrder } for the current inbox. This component is fully
// controlled — all favourite/reorder changes are reported up via onChange
// so the home nav (which renders `sidebarOrder` only) stays in sync.
//
// Unlike the live app, becoming a favourite (personal star or Team
// Favourite) never auto-pins a view into the sidebar — it always lands in
// the "Favourites" section first. Only a drag from Favourites into "In your
// sidebar" moves it into `sidebarOrder` (capped at MAX_FAVOURITES); dragging
// it back out returns it to `favouritesOrder`. Drag-and-drop is powered by
// @dnd-kit — same library as option_1 — across the two sections.
const AllViewsPanelOption2 = ({ inboxName, onBack, activeFilter, onFilterChange, viewsData, onChange, activeRole }) => {
  const [search, setSearch] = React.useState('');
  const [menuOpenFor, setMenuOpenFor] = React.useState(null);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });
  const [starTooltipFor, setStarTooltipFor] = React.useState(null);
  const [starTooltipPosition, setStarTooltipPosition] = React.useState({ top: 0, left: 0 });
  const [activeDragId, setActiveDragId] = React.useState(null);

  const views = viewsData?.views || [];
  // Admin and Agent each have their own personal Favourites for this inbox.
  const favouriteIdsByRole = viewsData?.favouriteIds || {};
  const favouriteIds = favouriteIdsByRole[activeRole] || [];
  const teamFavouriteIds = viewsData?.teamFavouriteIds || [];
  // Explicit membership of the two sections — `sidebarOrder` is exactly
  // what's pinned to the home nav (max MAX_FAVOURITES); `favouritesOrder` is
  // every other favourited (personal or Team) view, in this role's own
  // display order.
  const sidebarOrderByRole = viewsData?.sidebarOrder || {};
  const sidebarOrder = sidebarOrderByRole[activeRole] || [];
  const favouritesOrderByRole = viewsData?.favouritesOrder || {};
  const favouritesOrder = favouritesOrderByRole[activeRole] || [];

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

  const toggleFavourite = (id) => {
    const isFavourited = favouriteIds.includes(id);
    // At the cap, clicking an unfavourited star is a no-op — the hover
    // tooltip already explains why, nothing else needs to happen.
    if (!isFavourited && favouriteIds.length >= MAX_FAVOURITES) return;
    const nextFavouriteIds = isFavourited
      ? favouriteIds.filter((favId) => favId !== id)
      : [...favouriteIds, id];

    let nextSidebarOrder = sidebarOrder;
    let nextFavouritesOrder = favouritesOrder;

    if (!isFavourited) {
      // Newly favourited — always lands in Favourites, never auto-pinned.
      if (!sidebarOrder.includes(id) && !favouritesOrder.includes(id)) {
        nextFavouritesOrder = [...favouritesOrder, id];
      }
    } else if (!teamFavouriteIds.includes(id)) {
      // Un-favourited and not a Team Favourite either — it's not a
      // favourite at all anymore, so drop it from wherever it was sitting.
      nextSidebarOrder = sidebarOrder.filter((favId) => favId !== id);
      nextFavouritesOrder = favouritesOrder.filter((favId) => favId !== id);
    }

    onChange({
      views,
      favouriteIds: { ...favouriteIdsByRole, [activeRole]: nextFavouriteIds },
      sidebarOrder: { ...sidebarOrderByRole, [activeRole]: nextSidebarOrder },
      favouritesOrder: { ...favouritesOrderByRole, [activeRole]: nextFavouritesOrder },
      teamFavouriteIds,
    });
  };

  // Admin-only: move a view between "All Views" and "Favourites". A Team
  // Favourite is shared across every role, so it's added to (or removed
  // from) both roles' Favourites/sidebar state at once.
  const toggleTeamFavourite = (id) => {
    const isTeamFavourited = teamFavouriteIds.includes(id);
    if (!isTeamFavourited && teamFavouriteIds.length >= MAX_FAVOURITES) return;
    const nextTeamFavouriteIds = isTeamFavourited
      ? teamFavouriteIds.filter((favId) => favId !== id)
      : [...teamFavouriteIds, id];

    const nextSidebarOrder = { ...sidebarOrderByRole };
    const nextFavouritesOrder = { ...favouritesOrderByRole };
    ['Admin', 'Agent'].forEach((role) => {
      const roleSidebar = sidebarOrderByRole[role] || [];
      const roleFavourites = favouritesOrderByRole[role] || [];
      if (!isTeamFavourited) {
        // Newly a Team Favourite — lands in that role's Favourites, unless
        // it's already sitting somewhere (e.g. already personally pinned).
        nextSidebarOrder[role] = roleSidebar;
        nextFavouritesOrder[role] = roleSidebar.includes(id) || roleFavourites.includes(id)
          ? roleFavourites
          : [...roleFavourites, id];
      } else if (!(favouriteIdsByRole[role] || []).includes(id)) {
        // No longer a Team Favourite, and this role hasn't personally
        // favourited it either — remove it from wherever it was sitting.
        nextSidebarOrder[role] = roleSidebar.filter((favId) => favId !== id);
        nextFavouritesOrder[role] = roleFavourites.filter((favId) => favId !== id);
      } else {
        nextSidebarOrder[role] = roleSidebar;
        nextFavouritesOrder[role] = roleFavourites;
      }
    });

    onChange({
      views,
      favouriteIds: favouriteIdsByRole,
      sidebarOrder: nextSidebarOrder,
      favouritesOrder: nextFavouritesOrder,
      teamFavouriteIds: nextTeamFavouriteIds,
    });
    setMenuOpenFor(null);
  };

  const commitLists = (nextSidebar, nextFavourites) => {
    onChange({
      views,
      favouriteIds: favouriteIdsByRole,
      sidebarOrder: { ...sidebarOrderByRole, [activeRole]: nextSidebar },
      favouritesOrder: { ...favouritesOrderByRole, [activeRole]: nextFavourites },
      teamFavouriteIds,
    });
  };

  const findContainer = (id) => {
    if (id === 'sidebar-container') return 'sidebar';
    if (id === 'favourites-container') return 'favourites';
    if (sidebarOrder.includes(id)) return 'sidebar';
    if (favouritesOrder.includes(id)) return 'favourites';
    return null;
  };

  const handleDragStart = (event) => setActiveDragId(event.active.id);

  // Handles both same-section reordering and dragging across the two
  // sections — dropping into a full "In your sidebar" evicts its last
  // entry back into Favourites to make room.
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    const fromContainer = findContainer(activeId);
    const toContainer = findContainer(overId);
    if (!fromContainer || !toContainer) return;

    let nextSidebar = [...sidebarOrder];
    let nextFavourites = [...favouritesOrder];
    const fromArr = fromContainer === 'sidebar' ? nextSidebar : nextFavourites;
    const fromIndex = fromArr.indexOf(activeId);
    if (fromIndex === -1) return;

    if (fromContainer === toContainer) {
      if (activeId === overId) return;
      const toIndex = fromArr.indexOf(overId);
      const reordered = toIndex === -1 ? fromArr : arrayMove(fromArr, fromIndex, toIndex);
      if (fromContainer === 'sidebar') nextSidebar = reordered; else nextFavourites = reordered;
    } else {
      fromArr.splice(fromIndex, 1);
      const toArr = toContainer === 'sidebar' ? nextSidebar : nextFavourites;
      let toIndex = toArr.indexOf(overId);
      if (toIndex === -1) toIndex = toArr.length;
      if (toContainer === 'sidebar' && toArr.length >= MAX_FAVOURITES) {
        const evicted = toArr.pop();
        if (evicted && evicted !== activeId) nextFavourites.unshift(evicted);
        if (toIndex > toArr.length) toIndex = toArr.length;
      }
      toArr.splice(toIndex, 0, activeId);
    }

    commitLists(nextSidebar, nextFavourites);
  };

  const query = search.toLowerCase();
  const sidebarSlice = sidebarOrder
    .map((id) => viewsById[id])
    .filter((v) => v && v.name.toLowerCase().includes(query));
  const favouritesSlice = favouritesOrder
    .map((id) => viewsById[id])
    .filter((v) => v && v.name.toLowerCase().includes(query));
  const others = views.filter(
    (v) => !favouriteIds.includes(v.id) && !teamFavouriteIds.includes(v.id) && v.name.toLowerCase().includes(query)
  );

  const isSelected = (view) =>
    activeFilter?.inbox === inboxName && activeFilter?.type === view.name;

  // A view that's a Team Favourite swaps its row icon to the users-plus
  // glyph too, on top of the separate circle-heart indicator next to the
  // star/kebab.
  const rowIcon = (view) =>
    teamFavouriteIds.includes(view.id) ? <TeamFavRowIcon /> : <ViewTypeIcon icon={view.icon} />;

  const starTooltip = (view) => {
    if (favouriteIds.includes(view.id)) return 'Remove from favorites';
    if (favouriteIds.length >= MAX_FAVOURITES) return 'You can add up to 5 favorites';
    return 'Add to favorites';
  };

  // Shared row body (icon, name, star/team-fav, kebab) — used by the
  // draggable sidebar/Favourites rows and the plain All Views rows alike.
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
            className={`view-team-fav-indicator ${activeRole === 'Agent' ? 'agent-variant' : ''}`}
            aria-label="Team favourite"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setStarTooltipPosition({ top: rect.top - 6, left: rect.left + rect.width / 2 });
              setStarTooltipFor(view.id);
            }}
            onMouseLeave={() => setStarTooltipFor(null)}
          >
            <HeartCircleIcon />
            {starTooltipFor === view.id &&
              createPortal(
                <span
                  className={`view-star-tooltip ${activeRole === 'Agent' ? 'view-star-tooltip-multiline' : ''}`}
                  style={{ top: starTooltipPosition.top, left: starTooltipPosition.left }}
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
        {(view.type === 'custom'
          ? activeRole === 'Admin' || !teamFavouriteIds.includes(view.id)
          // Predefined (system) views have nothing an Agent can do from
          // here — only Admin gets the kebab, and only to pin/unpin it as
          // a Team Favourite. No Rename/Edit/Delete for these.
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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="section-title margin-top">
            In your sidebar ({sidebarSlice.length} of {MAX_FAVOURITES})
          </div>
          <SortableContext items={sidebarOrder} strategy={verticalListSortingStrategy}>
            <DroppableSection id="sidebar-container">
              {sidebarSlice.length > 0 ? (
                sidebarSlice.map((view) => (
                  <SortableRow key={view.id} view={view} isSelected={isSelected(view)} onSelect={() => onFilterChange?.({ inbox: inboxName, type: view.name })} renderRowBody={renderRowBody} />
                ))
              ) : (
                <div className="view-list-empty">Drag a favourite here to pin it to your sidebar.</div>
              )}
            </DroppableSection>
          </SortableContext>

          <div className="view-list-divider view-list-divider-dotted" />

          <div className="section-title margin-top">Favourites</div>
          <SortableContext items={favouritesOrder} strategy={verticalListSortingStrategy}>
            <DroppableSection id="favourites-container">
              {favouritesSlice.length > 0 ? (
                favouritesSlice.map((view) => (
                  <SortableRow key={view.id} view={view} isSelected={isSelected(view)} onSelect={() => onFilterChange?.({ inbox: inboxName, type: view.name })} renderRowBody={renderRowBody} />
                ))
              ) : (
                <div className="view-list-empty">
                  {sidebarSlice.length > 0
                    ? 'All your favourite views are in the sidebar.'
                    : 'There are no favourite views.'}
                </div>
              )}
            </DroppableSection>
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

// A section's droppable container — needed so a drop still registers when
// the list is empty (or the drop misses every row), not just when hovering
// directly over another sortable row.
const DroppableSection = ({ id, children }) => {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="nav-group view-list">
      {children}
    </div>
  );
};

// One draggable row within "In your sidebar" or "Favourites" — the drag
// handle (six dots, shown on hover in place of the row's normal icon) is
// the only element the pointer/keyboard listeners attach to, so clicking
// the rest of the row still just selects the view.
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

export default AllViewsPanelOption2;
