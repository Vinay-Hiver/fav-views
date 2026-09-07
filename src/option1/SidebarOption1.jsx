import React from 'react';
import '../Sidebar.css';
import MiniSidebar from '../components/MiniSidebar';
import MainSidebarPanelOption1 from './MainSidebarPanelOption1';

const SidebarOption1 = ({ activeFilter, onFilterChange, activeRole }) => {
  return (
    <div className="sidebar-root">
      <MiniSidebar />
      <MainSidebarPanelOption1
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        activeRole={activeRole}
      />
    </div>
  );
};

export default SidebarOption1;
