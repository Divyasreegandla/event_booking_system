import React, { useState, useEffect } from 'react';
import { getAllCoupons, createCoupon, toggleCouponStatus } from '../../services/api';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    coupon_code: '',
    discount_type: 'PERCENTAGE',
    discount_value: '',
    minimum_booking_amount: 0,
    expiry_date: '',
    usage_limit: '',
    is_active: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await getAllCoupons();
      setCoupons(response.data);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await createCoupon({
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        minimum_booking_amount: parseFloat(formData.minimum_booking_amount),
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null
      });
      toast.success('Coupon created successfully!');
      setShowCreateForm(false);
      setFormData({
        coupon_code: '',
        discount_type: 'PERCENTAGE',
        discount_value: '',
        minimum_booking_amount: 0,
        expiry_date: '',
        usage_limit: '',
        is_active: true
      });
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create coupon');
    }
  };

  const handleToggleStatus = async (couponId) => {
    try {
      await toggleCouponStatus(couponId);
      toast.success('Coupon status updated');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to update coupon status');
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
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px' }}>🎟️ Coupon Management</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
        >
          + Create New Coupon
        </button>
      </div>

      {/* Create Coupon Form */}
      {showCreateForm && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '16px' }}>Create New Coupon</h3>
          <form onSubmit={handleCreateCoupon}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Coupon Code *</label>
                <input
                  type="text"
                  value={formData.coupon_code}
                  onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })}
                  required
                  className="input-field"
                  placeholder="WELCOME20"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Discount Type *</label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  className="input-field"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Discount Value *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  required
                  className="input-field"
                  placeholder={formData.discount_type === 'PERCENTAGE' ? '10' : '100'}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Min Booking Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minimum_booking_amount}
                  onChange={(e) => setFormData({ ...formData, minimum_booking_amount: e.target.value })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Expiry Date *</label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Usage Limit</label>
                <input
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  className="input-field"
                  placeholder="Unlimited"
                />
              </div>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-primary">Create Coupon</button>
              <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Code</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Discount</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Min Amount</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Expiry</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Used</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => (
              <tr key={coupon.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{coupon.coupon_code}</td>
                <td style={{ padding: '12px' }}>
                  {coupon.discount_type === 'PERCENTAGE' 
                    ? `${coupon.discount_value}% OFF` 
                    : `₹${coupon.discount_value} OFF`}
                </td>
                <td style={{ padding: '12px' }}>₹{coupon.minimum_booking_amount}</td>
                <td style={{ padding: '12px' }}>{formatDate(coupon.expiry_date)}</td>
                <td style={{ padding: '12px' }}>
                  {coupon.used_count} / {coupon.usage_limit || '∞'}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    background: coupon.is_active ? '#d1fae5' : '#fee2e2',
                    color: coupon.is_active ? '#065f46' : '#991b1b'
                  }}>
                    {coupon.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => handleToggleStatus(coupon.id)}
                    style={{
                      padding: '4px 12px',
                      background: coupon.is_active ? '#fef3c7' : '#d1fae5',
                      color: coupon.is_active ? '#92400e' : '#065f46',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {coupon.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {coupons.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>No coupons found. Create your first coupon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;