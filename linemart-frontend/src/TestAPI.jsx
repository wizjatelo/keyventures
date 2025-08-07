import React, { useState, useEffect } from 'react';
import { cashierApi } from './services/api';

const TestAPI = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testFetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Testing API call to fetch categories...');
      
      const data = await cashierApi.getCategories();
      console.log('✅ Categories fetched successfully:', data);
      setCategories(data);
    } catch (err) {
      console.error('❌ Error fetching categories:', err);
      setError('Failed to fetch categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testFetchCategories();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h2>🧪 API Test Component</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={testFetchCategories}
          style={{
            backgroundColor: '#FF6B35',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer'
          }}
        >
          Test Fetch Categories
        </button>
      </div>

      {loading && (
        <div style={{ color: '#007bff' }}>
          🔄 Loading categories...
        </div>
      )}

      {error && (
        <div style={{ 
          color: '#dc3545', 
          backgroundColor: '#f8d7da', 
          padding: '1rem', 
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          ❌ {error}
        </div>
      )}

      {categories.length > 0 && (
        <div>
          <h3>✅ Categories Found ({categories.length}):</h3>
          <ul>
            {categories.map(category => (
              <li key={category.id}>
                <strong>ID:</strong> {category.id}, <strong>Name:</strong> {category.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div style={{ color: '#6c757d' }}>
          📭 No categories found
        </div>
      )}
    </div>
  );
};

export default TestAPI;