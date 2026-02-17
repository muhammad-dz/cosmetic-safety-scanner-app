import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { BeatLoader } from 'react-spinners';

const ScannerPage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [safetyData, setSafetyData] = useState(null);
  const [barcode, setBarcode] = useState('');
  const [searchMode, setSearchMode] = useState('image'); // 'image' or 'barcode'

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setSafetyData(null);
    }
  });

  // OCR SCAN - Extract ingredients from image
  const handleImageScan = async () => {
    if (!file) {
      alert('Please select an image first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Step 1: Extract ingredients via OCR
      const ocrResponse = await axios.post('http://localhost:8000/api/ocr/extract-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResult(ocrResponse.data);
      
      // Step 2: Check safety of extracted ingredients
      if (ocrResponse.data.ingredients && ocrResponse.data.ingredients.length > 0) {
        const safetyResponse = await axios.post('http://localhost:8000/api/ocr/batch-check', {
          ingredients: ocrResponse.data.ingredients
        });
        setSafetyData(safetyResponse.data);
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to scan product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // BARCODE SCAN - Lookup product from Open Beauty Facts
  const handleBarcodeLookup = async () => {
    if (!barcode) {
      alert('Please enter a barcode');
      return;
    }

    setLoading(true);
    setResult(null);
    setSafetyData(null);

    try {
      // Call Open Beauty Facts API through your backend
      const response = await axios.get(`http://localhost:8000/api/beauty/lookup/${barcode}`);
      
      if (response.data.success) {
        setResult({
          success: true,
          filename: 'Barcode Scan',
          message: 'Product found in Open Beauty Facts database',
          extracted_text: response.data.ingredients_text || 'No ingredients listed',
          ingredients: response.data.ingredients_list || []
        });

        // Check safety of ingredients
        if (response.data.ingredients_list && response.data.ingredients_list.length > 0) {
          const safetyResponse = await axios.post('http://localhost:8000/api/ocr/batch-check', {
            ingredients: response.data.ingredients_list
          });
          setSafetyData(safetyResponse.data);
        }

        // Show product info
        setSafetyData(prev => ({
          ...prev,
          product_info: {
            name: response.data.product_name,
            brand: response.data.brands,
            source: response.data.source
          }
        }));

      } else {
        alert('Product not found in database. Try image scan instead.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to lookup barcode. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return '#4caf50';
    if (score >= 6) return '#8bc34a';
    if (score >= 4) return '#ffc107';
    return '#f44336';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>🧴 Cosmetic Safety Scanner</h1>
      
      {/* Mode Selector */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px',
        background: '#f5f5f5',
        padding: '10px',
        borderRadius: '10px'
      }}>
        <button
          onClick={() => setSearchMode('image')}
          style={{
            flex: 1,
            padding: '12px',
            background: searchMode === 'image' ? '#667eea' : 'white',
            color: searchMode === 'image' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📸 Scan Label Image
        </button>
        <button
          onClick={() => setSearchMode('barcode')}
          style={{
            flex: 1,
            padding: '12px',
            background: searchMode === 'barcode' ? '#667eea' : 'white',
            color: searchMode === 'barcode' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📦 Lookup by Barcode
        </button>
      </div>

      {/* Image Upload Mode */}
      {searchMode === 'image' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <div {...getRootProps()} style={{
            border: '2px dashed #ccc',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            cursor: 'pointer',
            background: '#fafafa',
            transition: 'border-color 0.3s'
          }}>
            <input {...getInputProps()} />
            <p style={{ fontSize: '18px', color: '#666' }}>
              Drag & drop product label image here
            </p>
            <p style={{ fontSize: '14px', color: '#999' }}>
              or click to browse (PNG, JPG, JPEG)
            </p>
          </div>

          {preview && (
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <h3 style={{ color: '#333' }}>Preview:</h3>
              <img 
                src={preview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '300px', 
                  maxHeight: '300px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }} 
              />
              <p style={{ color: '#666', marginTop: '10px' }}>{file?.name}</p>
            </div>
          )}

          <button 
            onClick={handleImageScan}
            disabled={!file || loading}
            style={{
              marginTop: '30px',
              padding: '12px 30px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: (!file || loading) ? 0.7 : 1
            }}
          >
            {loading ? <BeatLoader size={8} color="white" /> : '🔍 Scan & Analyze Product'}
          </button>
        </div>
      )}

      {/* Barcode Mode */}
      {searchMode === 'barcode' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#333', marginBottom: '20px' }}>Enter Product Barcode</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Look up product from Open Beauty Facts database
          </p>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <input
              type="text"
              placeholder="e.g., 4005900001504"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              style={{
                padding: '12px',
                width: '300px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <button
              onClick={handleBarcodeLookup}
              disabled={!barcode || loading}
              style={{
                padding: '12px 30px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: (!barcode || loading) ? 0.7 : 1
              }}
            >
              {loading ? <BeatLoader size={8} color="white" /> : '🔍 Lookup Product'}
            </button>
          </div>
          
          <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
            Data provided by Open Beauty Facts (open source cosmetic database)
          </p>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0, color: '#333' }}>📊 Analysis Results</h2>
          
          {/* Product Info (from barcode lookup) */}
          {safetyData?.product_info && (
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '30px'
            }}>
              <h3 style={{ margin: '0 0 10px', color: 'white' }}>{safetyData.product_info.name}</h3>
              <p style={{ margin: '5px 0', opacity: 0.9 }}>Brand: {safetyData.product_info.brand}</p>
              <p style={{ margin: '5px 0', opacity: 0.9, fontSize: '12px' }}>Source: {safetyData.product_info.source}</p>
            </div>
          )}
          
          {/* Extracted Text */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#555' }}>Extracted Ingredients:</h3>
            <p style={{ 
              background: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '8px',
              fontFamily: 'monospace'
            }}>
              {result.extracted_text || 'No ingredients detected'}
            </p>
          </div>

          {/* Safety Scores */}
          {safetyData && safetyData.results && (
            <>
              <h3 style={{ color: '#555' }}>Ingredient Safety Analysis:</h3>
              
              {/* Overall Score */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '30px'
              }}>
                <h4 style={{ margin: '0 0 10px', color: 'white' }}>Overall Safety Rating</h4>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                  {safetyData.overall_rating || 'Unknown'}
                </div>
                <div style={{ fontSize: '24px', marginTop: '10px' }}>
                  Score: {safetyData.average_score || '?'}/10
                </div>
              </div>

              {/* Individual Ingredients */}
              <div style={{ display: 'grid', gap: '15px' }}>
                {safetyData.results.map((item, index) => (
                  <div key={index} style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '15px',
                    background: 'white'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '16px' }}>{item.ingredient}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          background: getScoreColor(item.safety_score),
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '15px',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          Score: {item.safety_score}/10
                        </div>
                        <span style={{
                          background: '#f0f0f0',
                          padding: '5px 10px',
                          borderRadius: '15px',
                          fontSize: '14px'
                        }}>
                          {item.rating}
                        </span>
                      </div>
                    </div>
                    {item.hazards && item.hazards.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <span style={{ color: '#f44336', fontSize: '14px' }}>
                          ⚠️ Hazards: {item.hazards.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ScannerPage;