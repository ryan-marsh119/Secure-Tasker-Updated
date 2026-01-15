import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import api from '../services/api';
import './TaskList.css';

const TaskList = () => {
  const { userRole, userPermissions } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        let endpoint = '/api/tasks/';
        if (userRole === 'supervisor') {
          endpoint = '/api/tasks/supervisor/';
        }

        const response = await api.get(endpoint);
        setTasks(response.data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    if (userPermissions.canView) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [userRole, userPermissions]);

  const handleDelete = async (taskId) => {
    if (!userPermissions.canDelete) return;

    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      let endpoint = `/api/tasks/${taskId}/`;
      if (userRole === 'supervisor') {
        endpoint = `/api/tasks/supervisor/${taskId}/`;
      }

      await api.delete(endpoint);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task');
    }
  };

  if (!userPermissions.canView) {
    return (
      <div className="task-list">
        <div className="task-list-header">
          <h2>Tasks</h2>
        </div>
        <div className="access-denied">
          <h3>Access Denied</h3>
          <p>You do not have permission to view tasks.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="task-list">
        <div className="loading">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-list">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>Tasks</h2>
        {userPermissions.canCreate && (
          <Link to="/tasks/new" className="create-button">
            Create New Task
          </Link>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks found</h3>
          <p>There are currently no tasks in the system.</p>
          {userPermissions.canCreate && (
            <Link to="/tasks/new" className="create-button">
              Create First Task
            </Link>
          )}
        </div>
      ) : (
        <div className="task-grid">
          {tasks.map(task => (
            <div key={task.id} className={`task-card ${task.completed ? 'completed' : 'pending'}`}>
              <div className="task-header">
                <h3>{task.title}</h3>
                <span className={`status-badge ${task.completed ? 'completed' : 'pending'}`}>
                  {task.completed ? 'Completed' : 'Pending'}
                </span>
              </div>

              <div className="task-content">
                <p className="description">{task.description}</p>

                <div className="task-meta">
                  <div className="meta-item">
                    <span className="label">Created:</span>
                    <span className="value">
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {task.completed && task.date_completed && (
                    <div className="meta-item">
                      <span className="label">Completed:</span>
                      <span className="value">
                        {new Date(task.date_completed).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {task.user_completed && (
                    <div className="meta-item">
                      <span className="label">Completed by:</span>
                      <span className="value">{task.user_completed}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="task-actions">
                <Link to={`/tasks/${task.id}`} className="action-button view">
                  View Details
                </Link>

                {userPermissions.canUpdate && (
                  <Link to={`/tasks/${task.id}/edit`} className="action-button edit">
                    Edit
                  </Link>
                )}

                {userPermissions.canDelete && (
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="action-button delete"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;