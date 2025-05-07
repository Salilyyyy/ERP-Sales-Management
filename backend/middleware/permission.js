const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF'
};

const PERMISSIONS = {
  // User management
  CREATE_USER: 'CREATE_USER',
  READ_USER: 'READ_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  
  // Product management
  CREATE_PRODUCT: 'CREATE_PRODUCT',
  READ_PRODUCT: 'READ_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  
  // Category management
  CREATE_CATEGORY: 'CREATE_CATEGORY',
  READ_CATEGORY: 'READ_CATEGORY',
  UPDATE_CATEGORY: 'UPDATE_CATEGORY',
  DELETE_CATEGORY: 'DELETE_CATEGORY',
  
  // Invoice management
  CREATE_INVOICE: 'CREATE_INVOICE',
  READ_INVOICE: 'READ_INVOICE',
  UPDATE_INVOICE: 'UPDATE_INVOICE',
  DELETE_INVOICE: 'DELETE_INVOICE',
  
  // Customer management
  CREATE_CUSTOMER: 'CREATE_CUSTOMER',
  READ_CUSTOMER: 'READ_CUSTOMER',
  UPDATE_CUSTOMER: 'UPDATE_CUSTOMER',
  DELETE_CUSTOMER: 'DELETE_CUSTOMER',
  
  // Supplier management
  CREATE_SUPPLIER: 'CREATE_SUPPLIER',
  READ_SUPPLIER: 'READ_SUPPLIER',
  UPDATE_SUPPLIER: 'UPDATE_SUPPLIER',
  DELETE_SUPPLIER: 'DELETE_SUPPLIER',
  
  // Stock management
  CREATE_STOCK: 'CREATE_STOCK',
  READ_STOCK: 'READ_STOCK',
  UPDATE_STOCK: 'UPDATE_STOCK',
  DELETE_STOCK: 'DELETE_STOCK',
  
  // Promotion management
  CREATE_PROMOTION: 'CREATE_PROMOTION',
  READ_PROMOTION: 'READ_PROMOTION',
  UPDATE_PROMOTION: 'UPDATE_PROMOTION',
  DELETE_PROMOTION: 'DELETE_PROMOTION',
  
  // Shipping management
  CREATE_SHIPPING: 'CREATE_SHIPPING',
  READ_SHIPPING: 'READ_SHIPPING',
  UPDATE_SHIPPING: 'UPDATE_SHIPPING',
  DELETE_SHIPPING: 'DELETE_SHIPPING'
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS), 
  [ROLES.MANAGER]: [
    // Users
    PERMISSIONS.READ_USER,
    PERMISSIONS.UPDATE_USER,
    
    // Products
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.READ_PRODUCT,
    PERMISSIONS.UPDATE_PRODUCT,
    PERMISSIONS.DELETE_PRODUCT,
    
    // Categories
    PERMISSIONS.CREATE_CATEGORY,
    PERMISSIONS.READ_CATEGORY,
    PERMISSIONS.UPDATE_CATEGORY,
    PERMISSIONS.DELETE_CATEGORY,
    
    // Invoices
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.READ_INVOICE,
    PERMISSIONS.UPDATE_INVOICE,
    PERMISSIONS.DELETE_INVOICE,
    
    // Customers
    PERMISSIONS.CREATE_CUSTOMER,
    PERMISSIONS.READ_CUSTOMER,
    PERMISSIONS.UPDATE_CUSTOMER,
    PERMISSIONS.DELETE_CUSTOMER,
    
    // Suppliers
    PERMISSIONS.CREATE_SUPPLIER,
    PERMISSIONS.READ_SUPPLIER,
    PERMISSIONS.UPDATE_SUPPLIER,
    PERMISSIONS.DELETE_SUPPLIER,
    
    // Stock
    PERMISSIONS.CREATE_STOCK,
    PERMISSIONS.READ_STOCK,
    PERMISSIONS.UPDATE_STOCK,
    PERMISSIONS.DELETE_STOCK,
    
    // Promotions
    PERMISSIONS.CREATE_PROMOTION,
    PERMISSIONS.READ_PROMOTION,
    PERMISSIONS.UPDATE_PROMOTION,
    PERMISSIONS.DELETE_PROMOTION,
    
    // Shipping
    PERMISSIONS.CREATE_SHIPPING,
    PERMISSIONS.READ_SHIPPING,
    PERMISSIONS.UPDATE_SHIPPING,
    PERMISSIONS.DELETE_SHIPPING
  ],
  [ROLES.STAFF]: [
    // Products
    PERMISSIONS.READ_PRODUCT,
    
    // Categories
    PERMISSIONS.READ_CATEGORY,
    
    // Invoices
    PERMISSIONS.CREATE_INVOICE,
    PERMISSIONS.READ_INVOICE,
    
    // Customers
    PERMISSIONS.CREATE_CUSTOMER,
    PERMISSIONS.READ_CUSTOMER,
    PERMISSIONS.UPDATE_CUSTOMER,
    
    // Stock
    PERMISSIONS.READ_STOCK,
    
    // Promotions
    PERMISSIONS.READ_PROMOTION,
    
    // Shipping
    PERMISSIONS.CREATE_SHIPPING,
    PERMISSIONS.READ_SHIPPING,
    PERMISSIONS.UPDATE_SHIPPING
  ]
};

const hasPermission = (userType, requiredPermission) => {
  const permissions = ROLE_PERMISSIONS[userType];
  return permissions && permissions.includes(requiredPermission);
};

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const userType = req.user.userType;
    
    if (!userType || !hasPermission(userType, requiredPermission)) {
      return res.status(403).json({
        error: 'Access denied. Insufficient permissions.'
      });
    }
    
    next();
  };
};

// Helper function to check multiple permissions (ANY of the permissions)
const checkAnyPermission = (requiredPermissions) => {
  return (req, res, next) => {
    const userType = req.user.userType;
    
    if (!userType || !requiredPermissions.some(permission => hasPermission(userType, permission))) {
      return res.status(403).json({
        error: 'Access denied. Insufficient permissions.'
      });
    }
    
    next();
  };
};

// Helper function to check multiple permissions (ALL permissions required)
const checkAllPermissions = (requiredPermissions) => {
  return (req, res, next) => {
    const userType = req.user.userType;
    
    if (!userType || !requiredPermissions.every(permission => hasPermission(userType, permission))) {
      return res.status(403).json({
        error: 'Access denied. Insufficient permissions.'
      });
    }
    
    next();
  };
};

module.exports = {
  ROLES,
  PERMISSIONS,
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  hasPermission
};
