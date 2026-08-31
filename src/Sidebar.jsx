import React from 'react';
import './Sidebar.css';
import MiniSidebar from './components/MiniSidebar';
import MainSidebarPanel from './components/MainSidebarPanel';

const Sidebar = ({ activeFilter, onFilterChange, activeRole }) => {
  return (
    <div className="sidebar-root">
      <MiniSidebar />
      <MainSidebarPanel
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        activeRole={activeRole}
      />
    </div>
  );
};

export default Sidebar;
