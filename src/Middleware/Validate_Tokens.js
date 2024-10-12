import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

function verifyAccessToken(token) {
    const secret = JWT_SECRET;
    console.log("verifying access token...");
    try {
        const decoded = jwt.verify(token, secret);
        console.log(decoded);
        return { success: true, data: decoded };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(token);
  
    if (!token) {
      return res.status(400).json({token_Status:false});
    }
  
    const result = verifyAccessToken(token);
    console.log(result);
  
    if (!result.success) {
      console.log("Token failure!!!")
      return res.status(403).json({ error: result.error , token_Status:false });
    }
  
    req.user = result.data;
    next();
}