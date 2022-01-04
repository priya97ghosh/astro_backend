require('dotenv').config();

const jwt = require('jsonwebtoken');

const options = {
    expiresIn: '1h',
}


async function adminJwt(email, adminId) {
    try {
        const payload = { email: email, id: adminId };
        const token = await jwt.sign(payload, process.env.JWT_SECRET, options);
        return { error: false, token: token };
    } catch (error) {
        return { error: true };
    }
}

module.exports = { adminJwt };