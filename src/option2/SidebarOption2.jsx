import React from 'react';
import '../Sidebar.css';
import MiniSidebar from '../components/MiniSidebar';
import MainSidebarPanelOption2 from './MainSidebarPanelOption2';

const SidebarOption2 = ({ activeFilter, onFilterChange, activeRole }) => {
  return (
    <div className="sidebar-root">
      <MiniSidebar />
      <MainSidebarPanelOption2
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        activeRole={activeRole}
      />
    </div>
  );
};

export default SidebarOption2;
