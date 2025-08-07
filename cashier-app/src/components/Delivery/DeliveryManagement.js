import React, { useState, useEffect } from 'react';
import { cashierApi } from '../../services/api';

const DeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [updatingDelivery, setUpdatingDelivery] = useState(null);

  useEffect(() => {
    fetchDeliveries();
    fetchRoutes();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await cashierApi.getDeliveries();
      if (response.error) {
        setError(response.error);
      } else {
        setDeliveries(response || []);
      }
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
      setError('Failed to load deliveries');
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await cashierApi.getDeliveryRoutes();
      if (response.error) {
        console.error('Failed to fetch routes:', response.error);
      } else {
        setRoutes(response || []);
      }
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (deliveryId, status, location = '', notes = '') => {
    try {
      setUpdatingDelivery(deliveryId);
      setError('');

      const response = await cashierApi.updateDeliveryStatus(deliveryId, {
        status,
        location,
        notes
      });

      if (response.error) {
        setError(response.error);
      } else {
        // Update the delivery in the list
        setDeliveries(deliveries.map(delivery => 
          delivery.id === deliveryId ? response : delivery
        ));
      }
    } catch (error) {
      console.error('Failed to update delivery status:', error);
      setError('Failed to update delivery status');
    } finally {
      setUpdatingDelivery(null);
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

  const DeliveryCard = ({ delivery }) => {
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [newStatus, setNewStatus] = useState(delivery.status);
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');

    const statusOptions = [
      'pending', 'confirmed', 'picked_up', 'in_transit', 
      'out_for_delivery', 'delivered', 'failed', 'cancelled'
    ];

    const handleSubmitUpdate = (e) => {
      e.preventDefault();
      handleUpdateStatus(delivery.id, newStatus, location, notes);
      setShowUpdateForm(false);
      setLocation('');
      setNotes('');
    };

    return (
      <div className="border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-800">
              {delivery.tracking_number}
            </h3>
            <p className="text-sm text-gray-600">
              Order: {delivery.transaction_receipt}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
            {formatStatus(delivery.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
          <div>
            <p className="text-gray-600">Customer</p>
            <p className="font-semibold">{delivery.customer_name}</p>
            <p className="text-gray-600">{delivery.customer_phone}</p>
          </div>
          <div>
            <p className="text-gray-600">Route</p>
            <p className="font-semibold">{delivery.route_name || 'Not assigned'}</p>
          </div>
          <div>
            <p className="text-gray-600">Fee</p>
            <p className="font-semibold">${delivery.delivery_fee}</p>
          </div>
        </div>

        <div className="text-sm mb-3">
          <p className="text-gray-600">Address</p>
          <p className="font-semibold">{delivery.delivery_address}</p>
        </div>

        {delivery.delivery_notes && (
          <div className="text-sm mb-3">
            <p className="text-gray-600">Notes</p>
            <p className="font-semibold">{delivery.delivery_notes}</p>
          </div>
        )}

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setShowUpdateForm(!showUpdateForm)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Update Status
          </button>
          
          {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
            <>
              <button
                onClick={() => handleUpdateStatus(delivery.id, 'delivered', '', 'Delivered successfully')}
                disabled={updatingDelivery === delivery.id}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50"
              >
                Mark Delivered
              </button>
              <button
                onClick={() => handleUpdateStatus(delivery.id, 'failed', '', 'Delivery failed')}
                disabled={updatingDelivery === delivery.id}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50"
              >
                Mark Failed
              </button>
            </>
          )}
        </div>

        {showUpdateForm && (
          <form onSubmit={handleSubmitUpdate} className="border-t pt-3 mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Current location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Update notes"
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updatingDelivery === delivery.id}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50"
              >
                {updatingDelivery === delivery.id ? 'Updating...' : 'Update'}
              </button>
              <button
                type="button"
                onClick={() => setShowUpdateForm(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="delivery-management">
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Delivery Management</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRouteForm(true)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
            >
              Manage Routes
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
            >
              Create Delivery
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700">
            {error}
          </div>
        )}

        <div className="p-6">
          {deliveries.length === 0 ? (
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

export default DeliveryManagement;