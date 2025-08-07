import React, { useState, useEffect } from 'react';
import { cashierApi } from '../../services/api';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingPayment, setProcessingPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await cashierApi.getPayments();
      
      if (response.error) {
        setError(response.error);
      } else {
        setPayments(response || []);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (paymentId, status) => {
    try {
      setProcessingPayment(paymentId);
      setError('');

      const response = await cashierApi.processPayment(paymentId, {
        status: status,
        gateway_response: {
          processed_by: 'cashier',
          timestamp: new Date().toISOString()
        }
      });

      if (response.error) {
        setError(response.error);
      } else {
        // Update the payment in the list
        setPayments(payments.map(payment => 
          payment.id === paymentId ? response : payment
        ));
      }
    } catch (error) {
      console.error('Failed to process payment:', error);
      setError('Failed to process payment');
    } finally {
      setProcessingPayment(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="payment-management">
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Payment Management</h2>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700">
            {error}
          </div>
        )}

        <div className="p-6">
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No payments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Payment #{payment.reference_number}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Transaction: {payment.transaction_receipt}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-600">Amount</p>
                      <p className="font-semibold text-green-600">${payment.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Method</p>
                      <p className="font-semibold capitalize">
                        {payment.payment_method.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Created</p>
                      <p className="font-semibold">{formatDate(payment.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Processed</p>
                      <p className="font-semibold">
                        {payment.processed_at ? formatDate(payment.processed_at) : 'Pending'}
                      </p>
                    </div>
                  </div>

                  {payment.processed_by_name && (
                    <div className="mb-3 text-sm text-gray-600">
                      Processed by: {payment.processed_by_name}
                    </div>
                  )}

                  {payment.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleProcessPayment(payment.id, 'completed')}
                        disabled={processingPayment === payment.id}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50"
                      >
                        {processingPayment === payment.id ? 'Processing...' : 'Mark Completed'}
                      </button>
                      <button
                        onClick={() => handleProcessPayment(payment.id, 'failed')}
                        disabled={processingPayment === payment.id}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50"
                      >
                        Mark Failed
                      </button>
                      <button
                        onClick={() => handleProcessPayment(payment.id, 'cancelled')}
                        disabled={processingPayment === payment.id}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;