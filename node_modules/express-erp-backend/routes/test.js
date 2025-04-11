const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /test:
 *   get:
 *     summary: Test endpoint
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', (req, res) => {
  res.status(200).send('Swagger is working!');
});

module.exports = router;
