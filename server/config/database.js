const mongoose = require('mongoose');

/**
 * MongoDB connection configuration
 */
class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      // MongoDB connection options (removed deprecated options)
      const options = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
      };

      // Connect to MongoDB
      this.connection = await mongoose.connect(process.env.MONGODB_URI, options);
      
      console.log(`MongoDB Connected: ${this.connection.connection.host}`);
      console.log(`Database: ${this.connection.connection.name}`);
      
      // Handle connection events
      this.setupEventListeners();
      
      return this.connection;
    } catch (error) {
      console.error('MongoDB connection error:', error.message);
      process.exit(1);
    }
  }

  setupEventListeners() {
    // Handle successful connection
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    // Handle connection errors
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    // Handle disconnection
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error.message);
    }
  }

  getConnection() {
    return this.connection;
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

module.exports = new Database();
