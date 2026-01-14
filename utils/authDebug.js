// utils/authDebug.js - Comprehensive authentication debugging utility
const jwt = require('jsonwebtoken');

/**
 * Enhanced authentication debugging utility
 */
const debugAuth = {
  /**
   * Validate JWT token and return detailed information
   */
  validateToken: (token, secret) => {
    try {
      if (!token) {
        return {
          valid: false,
          error: 'Token is null or undefined',
          details: null
        };
      }

      if (typeof token !== 'string') {
        return {
          valid: false,
          error: `Token is not a string, got: ${typeof token}`,
          details: { tokenType: typeof token, tokenValue: token }
        };
      }

      // Check if token has Bearer prefix
      const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      
      if (!actualToken) {
        return {
          valid: false,
          error: 'Token is empty after removing Bearer prefix',
          details: { originalToken: token }
        };
      }

      // Verify the token
      const decoded = jwt.verify(actualToken, secret);
      
      return {
        valid: true,
        error: null,
        details: {
          userId: decoded.id,
          mobile: decoded.mobile,
          role: decoded.role,
          roleId: decoded.role_id,
          exp: decoded.exp,
          iat: decoded.iat,
          expiresAt: new Date(decoded.exp * 1000),
          issuedAt: new Date(decoded.iat * 1000),
          isExpired: Date.now() >= decoded.exp * 1000,
          hasUserId: !!decoded.id
        }
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        details: {
          errorType: error.name,
          tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
        }
      };
    }
  },

  /**
   * Log authentication attempt with detailed information
   */
  logAuthAttempt: (req, result) => {
    const timestamp = new Date().toISOString();
    const path = req.path;
    const method = req.method;
    const authHeader = req.headers.authorization;
    
    console.log(`\n🔐 [${timestamp}] Authentication Debug:`);
    console.log(`   📍 ${method} ${path}`);
    console.log(`   🔑 Auth Header: ${authHeader ? 'Present' : 'Missing'}`);
    
    if (result.valid) {
      console.log(`   ✅ Status: Valid`);
      console.log(`   👤 User ID: ${result.details.userId}`);
      console.log(`   📱 Mobile: ${result.details.mobile}`);
      console.log(`   🏷️ Role: ${result.details.role}`);
      console.log(`   ⏰ Expires: ${result.details.expiresAt}`);
      console.log(`   🔄 Expired: ${result.details.isExpired ? 'YES' : 'NO'}`);
    } else {
      console.log(`   ❌ Status: Invalid`);
      console.log(`   🚫 Error: ${result.error}`);
      if (result.details) {
        console.log(`   📋 Details:`, result.details);
      }
    }
    console.log(''); // Empty line for readability
  },

  /**
   * Create enhanced authentication middleware
   */
  createAuthMiddleware: () => {
    return (req, res, next) => {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        const result = { valid: false, error: 'Authorization header missing' };
        debugAuth.logAuthAttempt(req, result);
        return res.status(401).json({ 
          success: false,
          message: 'Authorization header missing' 
        });
      }

      const token = authHeader.split(' ')[1];
      
      if (!token) {
        const result = { valid: false, error: 'Token missing from authorization header' };
        debugAuth.logAuthAttempt(req, result);
        return res.status(401).json({ 
          success: false,
          message: 'Token missing from authorization header' 
        });
      }

      const result = debugAuth.validateToken(token, process.env.JWT_SECRET);
      debugAuth.logAuthAttempt(req, result);

      if (!result.valid) {
        return res.status(403).json({ 
          success: false,
          message: 'Invalid token',
          error: result.error
        });
      }

      if (result.details.isExpired) {
        return res.status(401).json({ 
          success: false,
          message: 'Token has expired',
          expiredAt: result.details.expiresAt
        });
      }

      if (!result.details.hasUserId) {
        return res.status(403).json({ 
          success: false,
          message: 'Invalid token payload - missing user ID'
        });
      }

      // Set user on request object
      req.user = {
        id: result.details.userId,
        mobile: result.details.mobile,
        role: result.details.role,
        role_id: result.details.roleId
      };

      next();
    };
  }
};

module.exports = debugAuth;
