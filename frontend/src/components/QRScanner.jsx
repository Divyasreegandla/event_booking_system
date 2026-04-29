import React, { useState } from 'react';
import { verifyTicket } from '../services/api';
import toast from 'react-hot-toast';

const QRScanner = () => {
  const [ticketCode, setTicketCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!ticketCode) {
      toast.error('Please enter ticket code');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyTicket(ticketCode);
      setVerificationResult(response.data);
      toast.success(response.data.message);
    } catch (error) {
      const message = error.response?.data?.detail || 'Invalid ticket';
      toast.error(message);
      setVerificationResult({ valid: false, message });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTicketCode('');
    setVerificationResult(null);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '32px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>🎟️ Ticket Verification</h2>
        
        <div className="form-group">
          <label>Enter Ticket Code</label>
          <input
            type="text"
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
            placeholder="e.g., ABC123XYZ9-1"
            className="input-field"
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button onClick={handleVerify} disabled={loading} className="btn-primary" style={{ flex: 1 }}>
            {loading ? 'Verifying...' : 'Verify Ticket'}
          </button>
          <button onClick={handleClear} className="btn-secondary">
            Clear
          </button>
        </div>
        
        {verificationResult && (
          <div style={{ 
            marginTop: '24px', 
            padding: '20px', 
            borderRadius: '12px',
            background: verificationResult.valid ? '#d1fae5' : '#fee2e2',
            border: `2px solid ${verificationResult.valid ? '#10b981' : '#dc2626'}`
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '48px' }}>
                {verificationResult.valid ? '✅' : '❌'}
              </span>
              <h3 style={{ margin: '12px 0', color: verificationResult.valid ? '#065f46' : '#991b1b' }}>
                {verificationResult.valid ? 'VALID TICKET' : 'INVALID TICKET'}
              </h3>
              <p>{verificationResult.message}</p>
              
              {verificationResult.valid && (
                <div style={{ marginTop: '16px', textAlign: 'left' }}>
                  <p><strong>Event:</strong> {verificationResult.event_title}</p>
                  <p><strong>Ticket Code:</strong> {ticketCode}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;