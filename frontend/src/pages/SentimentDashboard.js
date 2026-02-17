import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BeatLoader } from 'react-spinners';

const SentimentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSentimentData();
  }, []);

  const fetchSentimentData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/sentiment/summary');
      setData(response.data);
    } catch (err) {
      setError('Failed to load sentiment data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <BeatLoader color="#667eea" size={15} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: '#f44336' }}>
        <h3>❌ {error}</h3>
      </div>
    );
  }

  const sentimentData = data?.data || {
    total_reviews: 0,
    sentiment_distribution: { positive: 0, neutral: 0, negative: 0 },
    percentages: { positive: 0, neutral: 0, negative: 0 },
    average_sentiment_score: 0,
    average_rating: 0,
    top_issues: []
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>📊 Sentiment Analysis Dashboard</h1>
      
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
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {/* Positive Bar */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>😊 Positive</span>
              <span>{sentimentData.percentages.positive}%</span>
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
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>😐 Neutral</span>
              <span>{sentimentData.percentages.neutral}%</span>
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
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>😞 Negative</span>
              <span>{sentimentData.percentages.negative}%</span>
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
              <span style={{ flex: 1, fontWeight: 'bold' }}>{issue.issue}</span>
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