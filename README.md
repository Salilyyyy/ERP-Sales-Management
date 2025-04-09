# ERP Management Sales System

## Overview
This is a comprehensive Enterprise Resource Planning (ERP) system focused on sales management. The system provides a robust platform for managing sales operations, inventory tracking, customer relationships, and business analytics.

## Project Structure
```
├── backend/               # Express.js server application
│   ├── prisma/           # Database ORM
│   │   ├── migrations/   # Database migrations
│   │   └── schema.prisma # Database schema
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication routes
│   │   ├── customers.js  # Customer management
│   │   ├── detailStockins.js # Stock-in details
│   │   ├── invoiceDetails.js # Invoice details
│   │   ├── invoices.js   # Invoice management
│   │   ├── postOffices.js # Post office management
│   │   ├── productCategories.js # Product category management
│   │   ├── products.js   # Product management
│   │   ├── promotions.js # Promotion management
│   │   ├── shipments.js  # Shipping management
│   │   ├── stockins.js   # Inventory management
│   │   ├── suppliers.js  # Supplier management
│   │   ├── test.js      # Test routes
│   │   └── users.js     # User management
│   ├── middleware/       # Custom middleware
│   │   └── auth.js      # Authentication middleware
│   ├── services/        # Business logic layer
│   │   └── auth.service.js # Authentication service
│   ├── utils/          # Helper utilities
│   │   └── jwt.js      # JWT utilities
│   └── index.js        # Application entry point
│
├── frontend/           # React application
│   ├── public/        # Static files and assets
│   ├── src/           # Source code
│   │   ├── assets/    # Images and resources
│   │   │   └── img/   # Image assets
│   │   ├── components/# Reusable UI components
│   │   │   ├── error/    # Error pages
│   │   │   ├── forgotPassword/ # Password recovery
│   │   │   ├── layout/   # Page layout components
│   │   │   ├── login/    # Authentication
│   │   │   ├── profile/  # User profile
│   │   │   ├── resetPassword/ # Password reset
│   │   │   ├── setting/  # App settings
│   │   │   └── sidebar/  # Navigation sidebar
│   │   ├── mock/      # Mock data
│   │   ├── pages/     # Page components
│   │   │   ├── categories/   # Product categories
│   │   │   ├── customer/     # Customer management
│   │   │   ├── dashboard/    # Dashboard
│   │   │   ├── employee/     # Employee management
│   │   │   ├── invoices/     # Invoice management
│   │   │   ├── postOffice/   # Post office
│   │   │   ├── products/     # Product management
│   │   │   ├── promotion/    # Promotion management
│   │   │   ├── shipping/     # Shipping management
│   │   │   ├── stockIn/      # Stock management
│   │   │   └── supplier/     # Supplier management
│   │   ├── App.js     # Root component
│   │   ├── firebase.js # Firebase configuration
│   │   └── index.js   # Entry point
│   ├── .env          # Environment variables
│   └── package.json   # Frontend dependencies
│
└── README.md          # Project documentation
```


## Features

- **Sales Management**
  - Invoice Generation and Management
  - Order Processing
  - Promotion Management
  - Shipping Management

- **Inventory Management**
  - Stock-in Management
  - Product Management
  - Product Categories
  - Supplier Management

- **Customer Management**
  - Customer Database
  - Post Office Integration
  - Customer Details
  - Shipping Information

- **Dashboard & Analytics**
  - Real-time Dashboard
  - Sales Overview
  - Business Performance Metrics
  - User Management
