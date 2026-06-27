/**
 * Role-based access control middleware.
 * Usage: authorize('super_admin', 'manager')
 * Must be used AFTER the authenticate middleware.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

/**
 * Shorthand: only super_admin
 */
const isSuperAdmin = authorize('super_admin');

/**
 * Shorthand: super_admin or manager
 */
const isManager = authorize('super_admin', 'manager');

/**
 * Shorthand: any staff role
 */
const isStaff = authorize('super_admin', 'manager', 'cashier', 'kitchen_staff');

/**
 * Shorthand: kitchen staff and above
 */
const isKitchenStaff = authorize('super_admin', 'manager', 'kitchen_staff');

export { authorize, isSuperAdmin, isManager, isStaff, isKitchenStaff };
export default authorize;
