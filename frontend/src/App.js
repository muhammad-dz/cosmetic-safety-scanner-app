import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🧴 Cosmetic Safety Scanner</h1>
        <p>🚀 Project setup successful!</p>
        <div style={{ marginTop: '20px', textAlign: 'left', maxWidth: '600px' }}>
          <h3>Next Steps:</h3>
          <ol>
            <li>Setup backend: <code>cd backend && pip install -r requirements.txt</code></li>
            <li>Run backend: <code>python -m app.main</code></li>
            <li>Setup frontend: <code>cd frontend && npm install</code></li>
            <li>Run frontend: <code>npm start</code></li>
          </ol>
        </div>
      </header>
    </div>
  );
}

export default App;
