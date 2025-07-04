const express = require('express');
const router = express.Router();

// Sample route
router.get('/', (req, res) => {
  res.json({
    message: 'API is working',
    version: '1.0.0'
  });
});

// Example users route
router.get('/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ]
  });
});

module.exports = router;
