import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import api from '../services/api';
import './SecretDetail.css';

const SecretDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole, userPermissions } = useOutletContext

  const [secret, setSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSecret = async () => {
      try {
        setLoading(true);
        let endpoint = `/api/secret/${id}/`;
        if (userRole === 'supervisor') {
          endpoint = `/api/secret/supervisor/${id}/`;
        }

        const response = await api.get(endpoint);
        setSecret(response.data);
      } catch (error) {
        console.error('Failed to fetch secret:', error);
        if (error.response?.status === 404) {
          setError('Secret data not found');
        } else {
          setError('Failed to load secret data details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (userPermissions.canView) {
      fetchSecret();
    } else {
      setLoading(false);
    }
  }, [id, userRole, userPermissions]);

  const handleDelete = async () => {
    if (!userPermissions.canDelete) return;

    if (!window.confirm('Are you sure you want to delete this secret data? This action cannot be undone.')) return;

    try {
      let endpoint = `/api/secret/${id}/`;
      if (userRole === 'supervisor') {
        endpoint = `/api/secret/supervisor/${id}/`;
      }

      await api.delete(endpoint);
      navigate('/secrets');
    } catch (error) {
      console.error('Failed to delete secret:', error);
      setError('Failed to delete secret data');
    }
  };

  if (!userPermissions.canView) {
    return (
      <div className="secret-detail">
        <div className="access-denied">
          <h3>Access Denied</h3>
          <p>You do not have permission to view this secret data.</p>
          <Link to="/secrets" className="back-link">Back to Secret Data</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="secret-detail">
        <div className="loading">Loading secret data details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="secret-detail">
        <div className="error-message">{error}</div>
        <Link to="/secrets" className="back-link">Back to Secret Data</Link>
      </div>
    );
  }

  if (!secret) {
    return (
      <div className="secret-detail">
        <div className="error-message">Secret data not found</div>
        <Link to="/secrets" className="back-link">Back to Secret Data</Link>
      </div>
    );
  }

  return (
    <div className="secret-detail">
      <div className="secret-actions">
        <Link to="/secrets" className="action-button back">
          Back to List
        </Link>

        {userPermissions.canUpdate && (
          <Link to={`/secrets/${secret.id}/edit`} className="action-button edit">
            Edit Secret Data
          </Link>
        )}
        {userPermissions.canDelete && (
          <button onClick={handleDelete} className="action-button delete">
            Delete Secret Data
          </button>
        )}
      </div>

      <div className="secret-detail-card">
        <div className="secret-header">
          <h2>Secret Data #{secret.id}</h2>
          <div className="classification-badges">
            <span className="classification-badge primary">CLASSIFIED</span>
            <span className="classification-badge secondary">LEVEL 1</span>
          </div>
        </div>

        <div className="secret-content">
          <div className="security-notice">
            <div className="notice-icon">⚠️</div>
            <div className="notice-text">
              <strong>SECURITY NOTICE:</strong> This information is classified.
              Access is restricted to authorized personnel only.
            </div>
          </div>

          <div className="detail-section">
            <h3>Secret Data Content</h3>
            <div className="secret-text-container">
              <pre className="secret-text">{secret.message}</pre>  // Changed to 'message' from 'secret_data'
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <h4>Record ID</h4>
              <p>{secret.id}</p>
            </div>

            <div className="detail-item">
              <h4>Created Date</h4>
              <p>{new Date(secret.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>

            {secret.updated_at && (
              <div className="detail-item">
                <h4>Last Modified</h4>
                <p>{new Date(secret.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretDetail;