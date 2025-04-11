const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
   res.send('Hello from Express!');
});

if (process.env.NODE_ENV !== 'lambda') {
   app.listen(port, () => {
      // console.log(`Server running on port ${port}`);
   });
}

module.exports = app;
