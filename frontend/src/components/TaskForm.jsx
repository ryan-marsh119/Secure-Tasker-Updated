import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import api from '../services/api';
import './TaskForm.css';

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole, userPermissions } = useOutletContext();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    completed: false,
    date_completed: null,
    user_completed: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      if (isEditing) {
        try {
          let endpoint = `/api/tasks/${id}/`;
          if (userRole === 'supervisor') {
            endpoint = `/api/tasks/supervisor/${id}/`;
          }
          const response = await api.get(endpoint);
          setFormData({
            title: response.data.title || '',
            description: response.data.description || '',
            completed: response.data.completed || false,
            date_completed: response.data.date_completed || null,
            user_completed: response.data.user_completed || ''
          });
        } catch (err) {
          console.error('Failed to fetch task:', err);
        }
      }
    };

    fetchTask();
  }, [isEditing, id, userRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let endpoint = isEditing ? `/api/tasks/${id}/` : '/api/tasks/';
      if (userRole === 'supervisor') {
        endpoint = isEditing ? `/api/tasks/supervisor/${id}/` : '/api/tasks/supervisor/';
      }
      if (isEditing) {
        await api.put(endpoint, formData);
      } else {
        await api.post(endpoint, formData);
      }
      navigate('/tasks');
    } catch (err) {
      console.error('Task save failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Conditional rendering based on permissions (example: hide sensitive fields if not allowed)
  if (!userPermissions.canCreate && !isEditing) {
    return <div>Permission denied to create tasks.</div>;
  }

  if (!userPermissions.canUpdate && isEditing) {
    return <div>Permission denied to update tasks.</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {userPermissions.canView && (  // Permission required for all fields - example usage
        <>
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
          <input type="checkbox" name="completed" checked={formData.completed} onChange={handleChange} /> Completed
          <input type="datetime-local" name="date_completed" value={formData.date_completed || ''} onChange={handleChange} />
          <input name="user_completed" value={formData.user_completed} onChange={handleChange} placeholder="User Completed" />
        </>
      )}
      <button type="submit" disabled={loading}>Save Task</button>
    </form>
  );
};

export default TaskForm;