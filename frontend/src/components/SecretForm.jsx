import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import api from '../services/api';
import './SecretForm.css';  // Assume CSS file exists, adjust if needed

const SecretForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole, userPermissions } = useOutletContext();
  const isEditing = !!id;

  const [formData, setFormData] = useState({ message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSecret = async () => {
      if (isEditing) {
        try {
          let endpoint = `/api/secret/${id}/`;
          if (userRole === 'supervisor') {
            endpoint = `/api/secret/supervisor/${id}/`;
          }
          const response = await api.get(endpoint);
          setFormData({ message: response.data.message || '' });
        } catch (err) {
          console.error('Failed to fetch secret:', err);
        }
      }
    };

    fetchSecret();
  }, [isEditing, id, userRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let endpoint = isEditing ? `/api/secret/${id}/` : '/api/secret/';
      if (userRole === 'supervisor') {
        endpoint = isEditing ? `/api/secret/supervisor/${id}/` : '/api/secret/supervisor/';
      }
      if (isEditing) {
        await api.put(endpoint, formData);
      } else {
        await api.post(endpoint, formData);
      }
      navigate('/secrets');
    } catch (err) {
      console.error('Secret save failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ message: e.target.value });
  };

  // Conditional rendering based on permissions (example: hide form if not allowed)
  if (!userPermissions.canCreate && !isEditing) {
    return <div>Permission denied to create secrets.</div>;
  }

  if (!userPermissions.canUpdate && isEditing) {
    return <div>Permission denied to update secrets.</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {userPermissions.canView && (  // Permission required for all fields - example usage
        <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Message" required />
      )}
      <button type="submit" disabled={loading}>Save Secret</button>
    </form>
  );
};

export default SecretForm;