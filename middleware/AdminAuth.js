const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const AdminAuth = async (req, res, next) => {
    try {
        const token = await req.headers.get('Authorization').replace('Bearer ', '');
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findOne({ _id: decoded.id });
        if (!admin) {
            return res.send(403).json({ message: "Admin not found" });
        }
        else {
            req.admin = admin;
            next();
        }
    }
    catch (e) {
        res.status(401).json({ message: "Not Authenticated" });
    }
}

module.exports = AdminAuth;