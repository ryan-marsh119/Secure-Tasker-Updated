import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const context = useOutletContext() || {};
  const userRole = context.userRole || 'unknown';
  const userPermissions = context.userPermissions || {};

  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalSecrets: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        let tasksResponse;
        if (userRole === 'unknown') return;

        if (userRole === 'supervisor') {
          tasksResponse = await api.get('/api/tasks/supervisor/');
        } else {
          tasksResponse = await api.get('/api/tasks/');
        }

        const tasks = tasksResponse.data || [];
        const completedTasks = tasks.filter(task => task.completed).length;

        let secretsResponse;
        if (userRole === 'supervisor') {
          secretsResponse = await api.get('/api/secret/supervisor/');
        } else {
          secretsResponse = await api.get('/api/secret/');
        }

        const secrets = secretsResponse.data || [];
        setStats({
          totalTasks: tasks.length,
          completedTasks,
          pendingTasks: tasks.length - completedTasks,
          totalSecrets: Array.isArray(secrets) ? secrets.length : (secrets ? 1 : 0)
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (userPermissions?.canView) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [userRole, userPermissions]);

  if (!userPermissions?.canView) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Dashboard</h2>
        </div>
        <div className="access-denied">
          <h3>Access Denied</h3>
          <p>You do not have permission to view this content.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Welcome to the Secure Tasker system. Your role: <strong>{userRole}</strong></p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <div className="stat-number">{stats.totalTasks}</div>
          <Link to="/tasks" className="stat-link">View Tasks</Link>
        </div>

        <div className="stat-card">
          <h3>Completed Tasks</h3>
          <div className="stat-number completed">{stats.completedTasks}</div>
          <Link to="/tasks" className="stat-link">View Tasks</Link>
        </div>

        <div className="stat-card">
          <h3>Pending Tasks</h3>
          <div className="stat-number pending">{stats.pendingTasks}</div>
          <Link to="/tasks" className="stat-link">View Tasks</Link>
        </div>

        <div className="stat-card">
          <h3>Secret Data Items</h3>
          <div className="stat-number">{stats.totalSecrets}</div>
          <Link to="/secrets" className="stat-link">View Secrets</Link>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          {userPermissions?.canCreate && (
            <>
              <Link to="/tasks/new" className="action-button primary">
                Create New Task
              </Link>
              <Link to="/secrets/new" className="action-button primary">
                Create Secret Data
              </Link>
            </>
          )}
          <Link to="/tasks" className="action-button secondary">
            View All Tasks
          </Link>
          <Link to="/secrets" className="action-button secondary">
            View Secret Data
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;