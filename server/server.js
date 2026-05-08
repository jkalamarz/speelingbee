const express = require('express');
const cors = require('cors');
const db = require('./db');
const playersRouter = require('./routes/players');
const progressRouter = require('./routes/progress');

const app = express();
const PORT = 3001;

app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api/players', playersRouter);
app.use('/api/progress', progressRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

db.initialize();
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
