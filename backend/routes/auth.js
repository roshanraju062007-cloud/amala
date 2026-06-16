// Auth Route Router
const express = require('express');
const router = express.Router();
router.post('/login', (req, res) => {
  res.json({ message: "Mock login endpoint active" });
});
module.exports = router;
