const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist/brobarber')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/brobarber/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});
