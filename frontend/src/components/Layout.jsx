import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Layout.css';

const Layout = () => {
  const { logout, isAuth } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('unknown');
  const [userPermissions, setUserPermissions] = useState({});

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const response = await api.get('/api/secret/user-permissions/');
        console.log('Raw user permissions response:', response.data);  // Debug full response
        const permissions = response.data || {};

        // Determine role based on backend response
        if (permissions.is_supervisor) {
          setUserRole('supervisor');
          setUserPermissions({
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canView: true
          });
        } else if (permissions.is_secret) {
          setUserRole('secret');
          setUserPermissions({
            canCreate: false,
            canUpdate: true,
            canDelete: false,
            canView: true
          });
        } else {
          setUserRole('unknown');
          setUserPermissions({
            canCreate: false,
            canUpdate: false,
            canDelete: false,
            canView: false
          });
        }
      } catch (error) {
        console.error('Failed to fetch user permissions:', error);
        setUserRole('unknown');
        setUserPermissions({
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canView: false
        });
      }
    };

    if (isAuth) {
      fetchUserPermissions();
    }
  }, [isAuth]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">Secure Tasker</h1>
            <span className="subtitle">Government Task Management System</span>
          </div>

          <div className="header-right">
            <span className="user-role">
              Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="navigation">
        <div className="nav-content">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>

          {userPermissions.canView && (
            <>
              <Link to="/tasks" className="nav-link">Tasks</Link>
              <Link to="/secrets" className="nav-link">Secret Data</Link>
            </>
          )}
        </div>
      </nav>

      <main className="main-content">
        <Outlet context={{ userRole, userPermissions }} />
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>© 2026 Government Task Management System. Authorized personnel only.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;