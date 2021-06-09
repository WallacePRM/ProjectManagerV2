const express = require('express');
const cors = require('cors');
const main = require('./main');
const session = require('./session');

const app = express();
const port = 5001;
const url = 'http://localhost:' + port;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {

    res.send('OK');
});

main.createRouters(app);
session.createRouters(app);

exports.startServer = (port, () => {

    app.listen(port, () => {

        console.log('Transmitting in ' + url);
    });
});
