# Express ERP Backend

A backend server for an ERP (Enterprise Resource Planning) system built with Express.js and Prisma ORM. The system includes functionality for managing products, invoices, customers, suppliers, shipments, and more.

## Features

- 🔐 JWT Authentication
- 📦 Product Management
- 🛍️ Invoice & Order Processing
- 👥 Customer Management
- 🏢 Supplier Management
- 📦 Inventory Management
- 🚚 Shipment Tracking
- 📊 API Documentation with Swagger

## Prerequisites

- Node.js (v12 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd express-erp-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following content:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
PORT=3000 # optional, defaults to 3000
```

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npm run prisma:seed
```

## Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Documentation

The API documentation is available through Swagger UI at:
```
http://localhost:3000/api-docs
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. All routes except `/auth` and `/test` require authentication.

### Registration
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "address": "123 Street",
  "phoneNumber": "1234567890",
  "department": "Sales",
  "IdentityCard": "123456789",
  "userType": "employee",
  "birthday": "1990-01-01"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## API Routes

All routes below require authentication token in the header:
```http
Authorization: Bearer your_jwt_token
```

### Available Endpoints

- `/promotions` - Manage promotional campaigns
- `/invoices` - Handle invoice operations
- `/invoice-details` - Manage invoice line items
- `/products` - Product management
- `/product-categories` - Product category operations
- `/suppliers` - Supplier management
- `/customers` - Customer management
- `/shipments` - Shipment tracking
- `/post-offices` - Post office management
- `/users` - User management
- `/stockins` - Stock intake management
- `/detail-stockins` - Detailed stock intake records

## Database Schema

The system uses PostgreSQL with Prisma ORM. Key models include:

- `Users` - System users and authentication
- `Products` - Product catalog
- `ProductCategories` - Product categorization
- `Customers` - Customer information
- `Suppliers` - Supplier details
- `Invoices` - Sales orders
- `InvoiceDetails` - Line items in sales orders
- `Promotions` - Promotional campaigns
- `Shipments` - Delivery tracking
- `PostOffices` - Shipping locations
- `Stockins` - Inventory intake
- `DetailStockins` - Detailed inventory records

## Development

The project uses the following development tools:

- `nodemon` for development auto-reload
- `prisma` for database ORM
- `swagger-jsdoc` and `swagger-ui-express` for API documentation
- `express-validator` for request validation

## License

ISC
