const JWT = require("jsonwebtoken");

const secret = "IqbalCamp"

function createtoken(user) {
    const payload={
        _id: user._id,
        email: user.email,
        profileImageURL: user.profileImageURL,
        role: user.role,
    }

    const token = JWT.sign(payload,secret);
    return token;
}

function verifyToken (token){
    const payload = JWT.verify(token,secret);
    return payload;
}

module.exports = {createtoken,verifyToken};