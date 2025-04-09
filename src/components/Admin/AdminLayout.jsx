import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>UT Library Admin</h2>
        </div>
        <nav className="admin-nav">
          <Link to="/" className="nav-link">
            <i className="fas fa-comment"></i> Chat Interface
          </Link>
          <Link to="/admin/knowledge-base" className="nav-link">
            <i className="fas fa-database"></i> Knowledge Base
          </Link>
        </nav>
      </div>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
