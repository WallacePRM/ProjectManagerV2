const express = require('express');
const cors = require('cors');
const main = require('./main');
const session = require('./session');

const app = express();
const port = process.env.PORT || 5001;
const url = 'http://localhost:' + port;

app.use('/app', express.static('app'));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {

    res.redirect(302, '/app');
});

main.createRouters(app);
session.createRouters(app);

exports.startServer = (port, () => {

    app.listen(port, () => {

        console.log('Transmitting in ' + url);
    });
});
