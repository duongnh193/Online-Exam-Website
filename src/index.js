import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';

// Add axios interceptors for debugging
axios.interceptors.request.use(
  config => {
    console.log(`🚀 Request: ${config.method.toUpperCase()} ${config.url}`, config);
    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    console.log(`✅ Response: ${response.status} ${response.config.url}`, response);
    return response;
  },
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('❌ Response Error:', error.response.status, error.response.data);
      console.log('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('❌ No Response from server:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('❌ Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
