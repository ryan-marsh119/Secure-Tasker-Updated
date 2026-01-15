import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import api from '../services/api';
import './SecretList.css';

const SecretList = () => {
  const { userRole, userPermissions } = useOutletContext();
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSecrets = async () => {
      try {
        setLoading(true);
        let endpoint = '/api/secret/';
        if (userRole === 'supervisor') {
          endpoint = '/api/secret/supervisor/';
        }

        const response = await api.get(endpoint);
        // Handle both array and single object responses
        const data = Array.isArray(response.data) ? response.data : [response.data];
        setSecrets(data);
      } catch (error) {
        console.error('Failed to fetch secrets:', error);
        setError('Failed to load secret data');
      } finally {
        setLoading(false);
      }
    };

    if (userPermissions.canView) {
      fetchSecrets();
    } else {
      setLoading(false);
    }
  }, [userRole, userPermissions]);

  const handleDelete = async (secretId) => {
    if (!userPermissions.canDelete) return;

    if (!window.confirm('Are you sure you want to delete this secret data?')) return;

    try {
      let endpoint = `/api/secret/${secretId}/`;
      if (userRole === 'supervisor') {
        endpoint = `/api/secret/supervisor/${secretId}/`;
      }

      await api.delete(endpoint);
      setSecrets(secrets.filter(secret => secret.id !== secretId));
    } catch (error) {
      console.error('Failed to delete secret:', error);
      setError('Failed to delete secret data');
    }
  };

  if (!userPermissions.canView) {
    return (
      <div className="secret-list">
        <div className="secret-list-header">
          <h2>Secret Data</h2>
        </div>
        <div className="access-denied">
          <h3>Access Denied</h3>
          <p>You do not have permission to view secret data.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="secret-list">
        <div className="loading">Loading secret data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="secret-list">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="secret-list">
      <div className="secret-list-header">
        <h2>Secret Data</h2>
        {userPermissions.canCreate && (
          <Link to="/secrets/new" className="create-button">
            Create New Secret
          </Link>
        )}
      </div>

      {secrets.length === 0 ? (
        <div className="empty-state">
          <h3>No Secret Data Available</h3>
          <p>There are currently no secret data items to display.</p>
          {userPermissions.canCreate && (
            <Link to="/secrets/new" className="create-button">
              Create First Secret Item
            </Link>
          )}
        </div>
      ) : (
        <div className="secret-grid">
          {secrets.map(secret => (
            <div key={secret.id} className="secret-card">
              <div className="secret-header">
                <h3>Secret Data #{secret.id}</h3>
                <span className="classification-badge">CLASSIFIED</span>
              </div>

              <div className="secret-content">
                <div className="secret-preview">
                  <p className="secret-text">
                    {secret.message ?  // Changed to 'message' from 'secret_data'
                      secret.message.length > 100
                        ? `${secret.message.substring(0, 100)}...`
                        : secret.message
                      : 'No data available'
                    }
                  </p>
                </div>

                <div className="secret-meta">
                  <div className="meta-item">
                    <span className="label">Created:</span>
                    <span className="value">
                      {new Date(secret.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {secret.updated_at && (
                    <div className="meta-item">
                      <span className="label">Last Updated:</span>
                      <span className="value">
                        {new Date(secret.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="secret-actions">
                <Link to={`/secrets/${secret.id}`} className="action-button view">
                  View Details
                </Link>

                {userPermissions.canUpdate && (
                  <Link to={`/secrets/${secret.id}/edit`} className="action-button edit">
                    Edit
                  </Link>
                )}

                {userPermissions.canDelete && (
                  <button
                    onClick={() => handleDelete(secret.id)}
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

export default SecretList;