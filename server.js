const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const initDB = require('./models/initDB');
const apiRoutes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
console.log('📄 Swagger UI available at /api-docs');

// ✅ Mount all routes under /api
app.use('/api', apiRoutes);

// Error Middleware
const { errorMiddleware } = require('./middleware/errorMiddleware');
app.use(errorMiddleware);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
    status: 'error'
  });
});



const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // Initialize database first
    await initDB();
    console.log('✅ Database initialization completed');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📁 Static files served from: ${__dirname}/uploads`);
      console.log(`\n📱 Access URLs:`);
      console.log(`   Local:    http://localhost:${PORT}`);
      console.log(`   Network:  http://192.168.3.101:${PORT}`);
      console.log(`   Swagger:  http://localhost:${PORT}/api-docs`);
      console.log(`\n✅ API Endpoints:`);
      console.log(`   GET  /api/categories`);
      console.log(`   GET  /api/foods`);
      console.log(`   GET  /api/cart`);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('🛑 Server shutting down...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
})();

process.on('exit', (code) => {
  console.log(`❌ Process exited with code ${code}`);
});
