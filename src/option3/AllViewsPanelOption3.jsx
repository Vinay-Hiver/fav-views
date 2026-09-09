import React from 'react';
import { createPortal } from 'react-dom';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MAX_FAVOURITES } from '../data/dummyViews';
import './option3.css';
import {
  BackIcon, SearchIcon, StarIcon, DragHandleIcon, ViewTypeIcon, KebabIcon,
  UsersStarIcon, RenameIcon, PencilIcon, TrashIcon, InfoIcon,
} from '../components/viewIcons';

// `viewsData` = { views, favouriteIds, teamFavouriteIds } for the current
// inbox. This component is fully controlled — all favourite/reorder changes
// are reported up via onChange so the home nav (favourite views) stays in
// sync.
//
// Option 3 brings back the earlier three-section layout: a separate
// "Favourites" (personal, drag-reorderable, capped) and "Team Favourites"
// (Admin-pinned, shared across roles) section, followed by "All Views". A
// view that's both personally and Team-favourited only shows once, in
// Favourites — Team Favourites is where it "lives" until someone stars it.
const AllViewsPanelOption3 = ({ inboxName, onBack, activeFilter, onFilterChange, viewsData, onChange, activeRole }) => {
  const [search, setSearch] = React.useState('');
  const [menuOpenFor, setMenuOpenFor] = React.useState(null);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });
  const [starTooltipFor, setStarTooltipFor] = React.useState(null);
  const [starTooltipPosition, setStarTooltipPosition] = React.useState({ top: 0, left: 0 });
  const [activeDragId, setActiveDragId] = React.useState(null);
  const [teamFavInfoTooltip, setTeamFavInfoTooltip] = React.useState(false);
  const [teamFavInfoPosition, setTeamFavInfoPosition] = React.useState({ top: 0, left: 0 });

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
    onChange({ views, favouriteIds: { ...favouriteIdsByRole, [activeRole]: nextFavouriteIds }, teamFavouriteIds });
  };

  // Admin-only: move a view between "All Views" and "Team Favourites".
  const toggleTeamFavourite = (id) => {
    const isTeamFavourited = teamFavouriteIds.includes(id);
    if (!isTeamFavourited && teamFavouriteIds.length >= MAX_FAVOURITES) return;
    const nextTeamFavouriteIds = isTeamFavourited
      ? teamFavouriteIds.filter((favId) => favId !== id)
      : [...teamFavouriteIds, id];
    onChange({ views, favouriteIds: favouriteIdsByRole, teamFavouriteIds: nextTeamFavouriteIds });
    setMenuOpenFor(null);
  };

  const handleDragStart = (event) => setActiveDragId(event.active.id);

  // Favourites is the only reorderable list — Team Favourites isn't
  // draggable (its order isn't user-controlled, only Admin add/remove via
  // the kebab).
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over || active.id === over.id) return;
    const fromIndex = favouriteIds.indexOf(active.id);
    const toIndex = favouriteIds.indexOf(over.id);
    if (fromIndex === -1 || toIndex === -1) return;
    const next = arrayMove(favouriteIds, fromIndex, toIndex);
    onChange({ views, favouriteIds: { ...favouriteIdsByRole, [activeRole]: next }, teamFavouriteIds });
  };

  const query = search.toLowerCase();
  const favourites = favouriteIds
    .map((id) => viewsById[id])
    .filter((v) => v && v.name.toLowerCase().includes(query));
  // A view that's both team- and personally-favourited only shows once, in
  // Favourites — Team Favourites is where it "lives" until someone stars it.
  const allTeamFavourites = teamFavouriteIds.map((id) => viewsById[id]).filter(Boolean);
  const teamFavouritesMovedToFavourites =
    allTeamFavourites.length > 0 && allTeamFavourites.every((v) => favouriteIds.includes(v.id));
  const teamFavourites = allTeamFavourites.filter(
    (v) => !favouriteIds.includes(v.id) && v.name.toLowerCase().includes(query)
  );
  const others = views.filter(
    (v) => !favouriteIds.includes(v.id) && !teamFavouriteIds.includes(v.id) && v.name.toLowerCase().includes(query)
  );

  const isSelected = (view) =>
    activeFilter?.inbox === inboxName && activeFilter?.type === view.name;

  // A Team Favourite is treated just like any other view here — same row
  // icon, same star. The only difference it gets is which section it sits
  // in.
  const rowIcon = (view) => <ViewTypeIcon icon={view.icon} />;

  const starTooltip = (view) => {
    if (favouriteIds.includes(view.id)) return 'Remove from favorites';
    if (favouriteIds.length >= MAX_FAVOURITES) return 'You can add up to 5 favorites';
    return 'Add to favorites';
  };

  // Shared row body (icon, name, star/team-fav, kebab) — used by the
  // draggable Favourites rows and the plain Team Favourites/All Views rows
  // alike.
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
              // The row this button sits on can reorder or move sections
              // right after the click, without a real mouseleave ever
              // firing — clear the tooltip explicitly so it doesn't get
              // stranded floating in place.
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
        {(view.type === 'custom'
          ? activeRole === 'Admin' || !teamFavouriteIds.includes(view.id)
          // Predefined (system) views have nothing an Agent can do from
          // here — only Admin gets the kebab, and only to pin/unpin it as
          // a Team Favourite.
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
                  <SortableRow key={view.id} view={view} isSelected={isSelected(view)} onSelect={() => onFilterChange?.({ inbox: inboxName, type: view.name })} renderRowBody={renderRowBody} />
                ))
              ) : (
                <div className="view-list-empty">No favourites yet — star a view below</div>
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

        <div className="section-title margin-top section-title-with-info">
          <span>Team Favourites</span>
          <span
            className="team-fav-info-icon"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setTeamFavInfoPosition({ top: rect.top - 6, left: rect.left + rect.width / 2 });
              setTeamFavInfoTooltip(true);
            }}
            onMouseLeave={() => setTeamFavInfoTooltip(false)}
          >
            <InfoIcon />
          </span>
          {teamFavInfoTooltip &&
            createPortal(
              <span
                className="view-star-tooltip view-star-tooltip-multiline"
                style={{ top: teamFavInfoPosition.top, left: teamFavInfoPosition.left }}
              >
                {activeRole === 'Admin' ? (
                  <>
                    <span>Views marked as team favourite</span>
                    <span>will show up here</span>
                  </>
                ) : (
                  <>
                    <span>Views marked as favourite</span>
                    <span>by your admin</span>
                  </>
                )}
              </span>,
              document.body
            )}
        </div>
        <div className="nav-group view-list">
          {teamFavourites.length > 0 ? (
            teamFavourites.map((view) => renderPlainRow(view))
          ) : (
            <div className="view-list-empty team-favourites-empty">
              {teamFavouritesMovedToFavourites
                ? 'All Team Favourites have been added to your Favourites'
                : 'No Team Favourites yet.'}
            </div>
          )}
        </div>

        <div className="view-list-divider" />

        <div className="section-title margin-top">All Views</div>
        <div className="nav-group view-list">
          {others.map((view) => renderPlainRow(view))}
        </div>
      </div>
    </div>
  );
};

// One draggable row within Favourites — the drag handle (six dots, shown on
// hover in place of the row's normal icon) is the only element the
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

export default AllViewsPanelOption3;
