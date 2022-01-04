require('dotenv').config();

const jwt = require('jsonwebtoken');

const options = {
    expiresIn: '1h',
}


async function astroJwt(email, astroId) {
    try {
        const payload = { email: email, id: astroId };
        const token = await jwt.sign(payload, process.env.JWT_SECRET, options);
        return { error: false, token: token };
    } catch (error) {
        return { error: true };
    }
}

module.exports = { astroJwt };