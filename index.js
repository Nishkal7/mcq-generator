const express = require('express');

const app = express();

// app.use(function (err, req, res, next) {
//     console.error(err.stack)
//     res.status(500).send('Something broke!')
// });
  
app.get('/', (req, res) => {
    res.send('Welcome to my app');
})

app.listen(3000, () => {
    console.log('Listening on port 3000.....')
});