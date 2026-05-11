const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/:playerId/:stage', (req, res) => {
  const { playerId, stage } = req.params;
  const progress = db.getStageProgress(Number(playerId), stage);
  res.json({ progress });
});

router.get('/:playerId/:stage/:mode', (req, res) => {
  const { playerId, stage, mode } = req.params;
  const progress = db.getProgress(Number(playerId), stage, mode);
  res.json({ progress });
});

router.post('/:playerId/:stage/:mode/:word', (req, res) => {
  const { playerId, stage, mode, word } = req.params;
  const { correct } = req.body;
  if (typeof correct !== 'boolean') {
    return res.status(400).json({ error: '"correct" must be a boolean' });
  }
  const result = db.recordAnswer(Number(playerId), stage, mode, word, correct);
  res.json(result);
});

module.exports = router;
