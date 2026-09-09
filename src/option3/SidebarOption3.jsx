import React from 'react';
import '../Sidebar.css';
import MiniSidebar from '../components/MiniSidebar';
import MainSidebarPanelOption3 from './MainSidebarPanelOption3';

const SidebarOption3 = ({ activeFilter, onFilterChange, activeRole }) => {
  return (
    <div className="sidebar-root">
      <MiniSidebar />
      <MainSidebarPanelOption3
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        activeRole={activeRole}
      />
    </div>
  );
};

export default SidebarOption3;
