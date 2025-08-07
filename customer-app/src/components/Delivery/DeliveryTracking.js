import React, { useState, useEffect } from 'react';
import { customerApi } from '../../services/api';

const DeliveryTracking = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await customerApi.getDeliveries();
      
      if (response.error) {
        setError(response.error);
      } else {
        setDeliveries(response.deliveries || []);
      }
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
      setError('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackByNumber = async (e) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await customerApi.trackDeliveryByNumber(trackingNumber.trim());
      
      if (response.error) {
        setError(response.error);
        setTrackingResult(null);
      } else {
        setTrackingResult(response);
      }
    } catch (error) {
      console.error('Tracking failed:', error);
      setError('Failed to track delivery');
      setTrackingResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'out_for_delivery': return 'text-blue-600 bg-blue-100';
      case 'in_transit': return 'text-yellow-600 bg-yellow-100';
      case 'picked_up': return 'text-purple-600 bg-purple-100';
      case 'confirmed': return 'text-indigo-600 bg-indigo-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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

  const DeliveryCard = ({ delivery, showTrackingHistory = false }) => (
    <div className="border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">
            Tracking: {delivery.tracking_number}
          </h3>
          <p className="text-sm text-gray-600">
            Order: {delivery.transaction_receipt}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
          {formatStatus(delivery.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <p className="text-gray-600">Customer</p>
          <p className="font-semibold">{delivery.customer_name}</p>
        </div>
        <div>
          <p className="text-gray-600">Phone</p>
          <p className="font-semibold">{delivery.customer_phone}</p>
        </div>
        <div>
          <p className="text-gray-600">Route</p>
          <p className="font-semibold">{delivery.route_name || 'Not assigned'}</p>
        </div>
        <div>
          <p className="text-gray-600">Delivery Fee</p>
          <p className="font-semibold">${delivery.delivery_fee}</p>
        </div>
      </div>

      <div className="text-sm mb-3">
        <p className="text-gray-600">Delivery Address</p>
        <p className="font-semibold">{delivery.delivery_address}</p>
      </div>

      {delivery.estimated_delivery_time && (
        <div className="text-sm mb-3">
          <p className="text-gray-600">Estimated Delivery</p>
          <p className="font-semibold">{formatDate(delivery.estimated_delivery_time)}</p>
        </div>
      )}

      {delivery.actual_delivery_time && (
        <div className="text-sm mb-3">
          <p className="text-gray-600">Delivered At</p>
          <p className="font-semibold text-green-600">{formatDate(delivery.actual_delivery_time)}</p>
        </div>
      )}

      {showTrackingHistory && delivery.tracking_history && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-semibold mb-2">Tracking History</h4>
          <div className="space-y-2">
            {delivery.tracking_history.map((update, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(update.status)}`}>
                    {formatStatus(update.status)}
                  </span>
                  {update.location && (
                    <span className="ml-2 text-gray-600">at {update.location}</span>
                  )}
                  {update.notes && (
                    <p className="text-gray-600 mt-1">{update.notes}</p>
                  )}
                </div>
                <span className="text-gray-500">{formatDate(update.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="delivery-tracking">
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Track Delivery</h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleTrackByNumber} className="mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number (e.g., TRK-ABC12345)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
              >
                {loading ? 'Tracking...' : 'Track'}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {trackingResult && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Tracking Result</h3>
              <DeliveryCard delivery={trackingResult.delivery} showTrackingHistory={true} />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">My Deliveries</h2>
        </div>

        <div className="p-6">
          {loading && deliveries.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No deliveries found</p>
            </div>
          ) : (
            <div>
              {deliveries.map((delivery) => (
                <DeliveryCard key={delivery.id} delivery={delivery} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracking;