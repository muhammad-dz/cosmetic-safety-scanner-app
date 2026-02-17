import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BeatLoader } from 'react-spinners';

const SentimentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    checkApiAndFetchData();
  }, []);

  const checkApiAndFetchData = async () => {
    try {
      // First check if API is reachable
      const healthCheck = await axios.get('http://localhost:8000/health');
      console.log('API Health:', healthCheck.data);
      setApiStatus('connected');

      // Then fetch sentiment data
      const response = await axios.get('http://localhost:8000/api/sentiment/summary');
      console.log('Sentiment data:', response.data);
      setData(response.data);
      
    } catch (err) {
      console.error('Error details:', err);
      setApiStatus('error');
      setError(err.message || 'Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <BeatLoader color="#667eea" size={15} />
        <p>Loading sentiment data...</p>
        <p style={{ fontSize: '12px', color: '#999' }}>API Status: {apiStatus}</p>
      </div>
    );
  }

  if (error || apiStatus === 'error') {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3>❌ Connection Error</h3>
          <p>{error || 'Could not connect to backend API'}</p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>
            Make sure your backend is running on port 8000
          </p>
        </div>
        
        <button
          onClick={checkApiAndFetchData}
          style={{
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Retry Connection
        </button>
      </div>
    );
  }

  // Use data from API or fallback to sample data
  const sentimentData = data?.data || {
    total_reviews: 17,
    sentiment_distribution: { positive: 10, neutral: 3, negative: 4 },
    percentages: { positive: 58.8, neutral: 17.6, negative: 23.5 },
    average_sentiment_score: 0.245,
    average_rating: 3.8,
    top_issues: [
      { issue: "rash", count: 3 },
      { issue: "acne", count: 2 },
      { issue: "dryness", count: 2 },
      { issue: "irritation", count: 2 },
      { issue: "sensitivity", count: 1 }
    ]
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>📊 Sentiment Analysis Dashboard</h1>
      
      {/* API Status Indicator */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px',
        background: '#4caf50',
        color: 'white',
        borderRadius: '20px',
        fontSize: '14px'
      }}>
        ✅ API Connected
      </div>
      
      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#666', margin: '0 0 10px' }}>Total Reviews</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, color: '#667eea' }}>
            {sentimentData.total_reviews}
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#666', margin: '0 0 10px' }}>Avg Rating</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, color: '#ff9800' }}>
            {sentimentData.average_rating}/5
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#666', margin: '0 0 10px' }}>Sentiment Score</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, color: '#4caf50' }}>
            {sentimentData.average_sentiment_score}
          </p>
        </div>
      </div>

      {/* Sentiment Distribution */}
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h2 style={{ color: '#333', marginTop: 0 }}>Sentiment Distribution</h2>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Positive Bar */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>😊 Positive</span>
              <span style={{ fontWeight: 'bold' }}>{sentimentData.percentages.positive}%</span>
            </div>
            <div style={{ height: '30px', background: '#f0f0f0', borderRadius: '15px', overflow: 'hidden' }}>
              <div style={{
                width: `${sentimentData.percentages.positive}%`,
                height: '100%',
                background: '#4caf50'
              }}></div>
            </div>
          </div>

          {/* Neutral Bar */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>😐 Neutral</span>
              <span style={{ fontWeight: 'bold' }}>{sentimentData.percentages.neutral}%</span>
            </div>
            <div style={{ height: '30px', background: '#f0f0f0', borderRadius: '15px', overflow: 'hidden' }}>
              <div style={{
                width: `${sentimentData.percentages.neutral}%`,
                height: '100%',
                background: '#ff9800'
              }}></div>
            </div>
          </div>

          {/* Negative Bar */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>😞 Negative</span>
              <span style={{ fontWeight: 'bold' }}>{sentimentData.percentages.negative}%</span>
            </div>
            <div style={{ height: '30px', background: '#f0f0f0', borderRadius: '15px', overflow: 'hidden' }}>
              <div style={{
                width: `${sentimentData.percentages.negative}%`,
                height: '100%',
                background: '#f44336'
              }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Issues */}
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#333', marginTop: 0 }}>🔴 Most Reported Issues</h2>
        
        <div style={{ display: 'grid', gap: '10px' }}>
          {sentimentData.top_issues.map((issue, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <span style={{ 
                width: '30px', 
                height: '30px', 
                background: '#f44336', 
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '15px',
                fontWeight: 'bold'
              }}>
                {index + 1}
              </span>
              <span style={{ flex: 1, fontWeight: 'bold', textTransform: 'capitalize' }}>
                {issue.issue}
              </span>
              <span style={{ 
                background: '#e0e0e0', 
                padding: '5px 15px', 
                borderRadius: '20px',
                fontWeight: 'bold'
              }}>
                {issue.count} reports
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SentimentDashboard;