
const jwt = require('jsonwebtoken');

exports.generateToken = (id) => {

    return jwt.sign({user_id: id}, 'myscrectkey');
}

exports.getTokenData = (token) => {

    return jwt.verify(token, 'myscrectkey');
}