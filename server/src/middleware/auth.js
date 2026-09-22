import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'fintrack_super_secret_jwt_key_2026_dev';

    const decoded = jwt.verify(token, secret);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
  }
};
