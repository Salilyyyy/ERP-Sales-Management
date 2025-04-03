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
│   │   ├── invoices.js   # Invoice management
│   │   ├── products.js   # Product management
│   │   ├── promotions.js # Promotion management
│   │   ├── shipments.js  # Shipping management
│   │   ├── stockins.js   # Inventory management
│   │   └── suppliers.js  # Supplier management
│   ├── middleware/       # Custom middleware
│   ├── services/        # Business logic layer
│   ├── utils/          # Helper utilities
│   └── index.js        # Application entry point
│
├── frontend/           # React application
│   ├── public/        # Static files and assets
│   ├── src/           # Source code
│   │   ├── assets/    # Images and resources
│   │   │   └── img/   # Image assets
│   │   ├── components/# Reusable UI components
│   │   │   ├── layout/# Page layout components
│   │   │   └── sidebar/# Navigation sidebar
│   │   ├── constants/ # Application constants
│   │   ├── pages/     # Page components
│   │   │   └── dashboard/# Dashboard page
│   │   ├── App.js     # Root component
│   │   └── index.js   # Entry point
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
