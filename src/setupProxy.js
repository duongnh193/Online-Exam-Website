const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('💡 Setting up API proxy middleware...');
  
  // More detailed debug logging
  const apiProxy = createProxyMiddleware({
    target: 'http://localhost:8080',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/api', // no rewrite needed, just for clarity
    },
    logLevel: 'debug',
    onProxyReq: function(proxyReq, req, res) {
      // Log detailed proxy request
      console.log(`\n🚀 Proxying ${req.method} request to: ${req.path}`);
      console.log(`  Full URL: http://localhost:8080${req.path}`);
      console.log('  Headers:', JSON.stringify(req.headers, null, 2));
      
      // Log request body for POST/PUT requests
      if (req.method === 'POST' || req.method === 'PUT') {
        const bodyData = req.body ? JSON.stringify(req.body) : '(no body)';
        console.log('  Request body:', bodyData);
      }
    },
    onProxyRes: function(proxyRes, req, res) {
      // Log detailed proxy response
      console.log(`📥 Proxy response: ${proxyRes.statusCode} ${req.method} ${req.path}`);
      
      // Add special handling for 404 errors
      if (proxyRes.statusCode === 404) {
        console.error(`‼️ 404 ERROR: Route not found: ${req.method} ${req.path}`);
        console.error(`   Full URL: http://localhost:8080${req.path}`);
        console.error(`   This might indicate the API endpoint doesn't exist in your backend.`);
        console.error(`   Check your controller mappings in the Spring Boot application.`);
      } else if (proxyRes.statusCode === 401) {
        console.error(`🔐 401 UNAUTHORIZED: Authentication required for: ${req.method} ${req.path}`);
        console.error(`   This might indicate that your JWT token is missing, expired, or invalid.`);
        console.error(`   Headers sent: ${JSON.stringify(req.headers.authorization || '(none)')}`);
      }
    },
    onError: function(err, req, res) {
      console.error(`\n❌ Proxy error for ${req.method} ${req.path}:`, err.message);
      console.error(`   Full URL attempted: http://localhost:8080${req.path}`);
      
      // Send a friendly error response
      if (!res.headersSent) {
        res.writeHead(500, {
          'Content-Type': 'application/json'
        });
        const errorResponse = {
          message: 'Error connecting to API server. Is it running?',
          error: err.message,
          url: `http://localhost:8080${req.path}`,
          method: req.method,
          solution: 'Make sure your Spring Boot backend is running on port 8080'
        };
        console.log('Returning error response:', errorResponse);
        res.end(JSON.stringify(errorResponse));
      }
    },
    // Set a shorter timeout for quicker error responses
    proxyTimeout: 10000
  });

  // Apply the proxy middleware to all /api routes
  app.use('/api', apiProxy);
  
  // Log all requests to help debug
  app.use((req, res, next) => {
    console.log('📊 Request intercepted:', req.method, req.url);
    next();
  });
}; 