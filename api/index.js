const express = require('express');
const cors = require('cors');
const app = express();
const port = 5001;
const url = 'http://localhost:' + port;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {

    res.send('OK');
});



app.listen(port, () => {

    console.log('transmitting in ' + url);
});