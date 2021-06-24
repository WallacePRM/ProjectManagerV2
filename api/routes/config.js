
const nodemailer = require('nodemailer');
exports.host = 'http://projectmanagerv2.herokuapp.com';

exports.transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});