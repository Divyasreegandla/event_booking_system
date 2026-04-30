import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole } from '../../services/api';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      await updateUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update role');
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <BackButton />
      <h1 style={{ fontSize: '28px', marginBottom: '24px' }}>Manage Users</h1>

      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '16px' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '16px' }}>Username</th>
                <th style={{ textAlign: 'left', padding: '16px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '16px' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '16px' }}>Joined</th>
                <th style={{ textAlign: 'center', padding: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px' }}>{user.id}</td>
                  <td style={{ padding: '16px', fontWeight: '500' }}>{user.username}</td>
                  <td style={{ padding: '16px' }}>{user.email}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      background: user.role === 'ADMIN' ? '#fee2e2' : user.role === 'ORGANIZER' ? '#fed7aa' : '#d1fae5',
                      color: user.role === 'ADMIN' ? '#991b1b' : user.role === 'ORGANIZER' ? '#9a3412' : '#065f46',
                      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{formatDate(user.created_at)}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={updating === user.id}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}
                    >
                      <option value="USER">User</option>
                      <option value="ORGANIZER">Organizer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                   </td>
                 </tr>
              ))}
            </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;