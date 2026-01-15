import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import api from '../services/api';
import './TaskDetail.css';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole, userPermissions } = useOutletContext();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        let endpoint = `/api/tasks/${id}/`;
        if (userRole === 'supervisor') {
          endpoint = `/api/tasks/supervisor/${id}/`;
        }

        const response = await api.get(endpoint);
        setTask(response.data);
      } catch (error) {
        console.error('Failed to fetch task:', error);
        if (error.response?.status === 404) {
          setError('Task not found');
        } else {
          setError('Failed to load task details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (userPermissions.canView) {
      fetchTask();
    } else {
      setLoading(false);
    }
  }, [id, userRole, userPermissions]);

  const handleDelete = async () => {
    if (!userPermissions.canDelete) return;

    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      let endpoint = `/api/tasks/${id}/`;
      if (userRole === 'supervisor') {
        endpoint = `/api/tasks/supervisor/${id}/`;
      }

      await api.delete(endpoint);
      navigate('/tasks');
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task');
    }
  };

  if (!userPermissions.canView) {
    return (
      <div className="task-detail">
        <div className="access-denied">
          <h3>Access Denied</h3>
          <p>You do not have permission to view this task.</p>
          <Link to="/tasks" className="back-link">Back to Tasks</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="task-detail">
        <div className="loading">Loading task details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-detail">
        <div className="error-message">{error}</div>
        <Link to="/tasks" className="back-link">Back to Tasks</Link>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="task-detail">
        <div className="error-message">Task not found</div>
        <Link to="/tasks" className="back-link">Back to Tasks</Link>
      </div>
    );
  }

  return (
    <div className="task-detail">
      <div className="detail-header">
        <Link to="/tasks" className="back-link">← Back to Tasks</Link>
        <div className="header-actions">
          {userPermissions.canUpdate && (
            <Link to={`/tasks/${task.id}/edit`} className="action-button edit">
              Edit Task
            </Link>
          )}
          {userPermissions.canDelete && (
            <button onClick={handleDelete} className="action-button delete">
              Delete Task
            </button>
          )}
        </div>
      </div>

      <div className="task-detail-card">
        <div className="task-header">
          <h2>{task.title}</h2>
          <span className={`status-badge ${task.completed ? 'completed' : 'pending'}`}>
            {task.completed ? 'Completed' : 'Pending'}
          </span>
        </div>

        <div className="task-content">
          <div className="detail-section">
            <h3>Description</h3>
            <p className="description">{task.description}</p>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <h4>Task ID</h4>
              <p>{task.id}</p>
            </div>

            <div className="detail-item">
              <h4>Created Date</h4>
              <p>{new Date(task.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>

            {task.completed && task.date_completed && (
              <div className="detail-item">
                <h4>Completion Date</h4>
                <p>{new Date(task.date_completed).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            )}

            {task.user_completed && (
              <div className="detail-item">
                <h4>Completed By</h4>
                <p>{task.user_completed}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;