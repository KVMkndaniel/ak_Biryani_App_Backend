const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log(`🔐 Auth middleware - Path: ${req.path}, AuthHeader: ${authHeader ? 'Present' : 'Missing'}`);
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.error('❌ Auth middleware - Token missing from authorization header');
      return res.status(401).json({ message: 'Token missing from authorization header' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('❌ Auth middleware - Token verification failed:', err.message);
        return res.status(403).json({ message: 'Invalid token' });
      }
      
      console.log(`✅ Auth middleware - User authenticated:`, { id: user.id, email: user.email });
      
      // Ensure user object has required fields
      if (!user.id) {
        console.error('❌ Auth middleware - JWT payload missing user ID:', user);
        return res.status(403).json({ message: 'Invalid token payload - missing user ID' });
      }
      
      req.user = user;
      next();
    });
  } else {
    console.error('❌ Auth middleware - Authorization header missing');
    res.status(401).json({ message: 'Authorization header missing' });
  }
};

module.exports = authenticateJWT;
