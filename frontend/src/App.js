import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ScannerPage from './pages/ScannerPage';
import SentimentDashboard from './pages/SentimentDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white', 
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0 }}>🧴 Cosmetic Safety Scanner</h1>
            <nav>
              <Link to="/" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>Scanner</Link>
              <Link to="/sentiment" style={{ color: 'white', textDecoration: 'none' }}>Sentiment Dashboard</Link>
            </nav>
          </div>
        </header>
        
        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<ScannerPage />} />
            <Route path="/sentiment" element={<SentimentDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;