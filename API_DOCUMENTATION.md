# ERP Sales Management System API Documentation

## Base URL

```
{{ENDPOINT_URL}} or http://localhost:10000
```

## Authentication

### Login
- **Endpoint:** `/auth/login`
- **Method:** POST
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "string",
  "rememberMe": false
}
```
- **Response:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string"
  }
}
```

### Password Reset Request
- **Endpoint:** `/auth/forgot-password`
- **Method:** POST
- **Body:**
```json
{
  "email": "string"
}
```

### Verify Reset Token
- **Endpoint:** `/auth/verify-reset-token/:token`
- **Method:** GET

### Reset Password
- **Endpoint:** `/auth/reset-password`
- **Method:** POST
- **Body:**
```json
{
  "token": "string",
  "newPassword": "string"
}
```

## Products

### Get All Products
- **Endpoint:** `/products`
- **Method:** GET
- **Query Parameters:**
  - page (optional)
  - limit (optional)
  - search (optional)
  - category (optional)
  - isArchived (optional)

### Create Product
- **Endpoint:** `/products`
- **Method:** POST
- **Body:**
```json
{
  "name": "string",
  "description": "string",
  "price": "number",
  "categoryId": "string",
  "image": "string",
  "quantity": "number"
}
```

### Get Product by ID
- **Endpoint:** `/products/:id`
- **Method:** GET

### Update Product
- **Endpoint:** `/products/:id`
- **Method:** PUT
- **Body:** Same as Create Product

### Delete Product
- **Endpoint:** `/products/:id`
- **Method:** DELETE

## Product Categories

### Get All Categories
- **Endpoint:** `/product-categories`
- **Method:** GET
- **Query Parameters:**
  - page (optional)
  - limit (optional)
  - search (optional)

### Create Category
- **Endpoint:** `/product-categories`
- **Method:** POST
- **Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

### Get Category by ID
- **Endpoint:** `/product-categories/:id`
- **Method:** GET

### Update Category
- **Endpoint:** `/product-categories/:id`
- **Method:** PUT
- **Body:** Same as Create Category

### Delete Category
- **Endpoint:** `/product-categories/:id`
- **Method:** DELETE

## Customers

### Get All Customers
- **Endpoint:** `/customers`
- **Method:** GET
- **Query Parameters:**
  - page (optional)
  - limit (optional)
  - search (optional)

### Create Customer
- **Endpoint:** `/customers`
- **Method:** POST
- **Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string"
}
```

### Get Customer by ID
- **Endpoint:** `/customers/:id`
- **Method:** GET

### Update Customer
- **Endpoint:** `/customers/:id`
- **Method:** PUT
- **Body:** Same as Create Customer

### Delete Customer
- **Endpoint:** `/customers/:id`
- **Method:** DELETE

## Invoices

### Get All Invoices
- **Endpoint:** `/invoices`
- **Method:** GET
- **Query Parameters:**
  - page (optional)
  - limit (optional)
  - search (optional)
  - startDate (optional)
  - endDate (optional)

### Create Invoice
- **Endpoint:** `/invoices`
- **Method:** POST
- **Body:**
```json
{
  "customerId": "string",
  "items": [
    {
      "productId": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "total": "number",
  "status": "string"
}
```

### Get Invoice by ID
- **Endpoint:** `/invoices/:id`
- **Method:** GET

### Update Invoice
- **Endpoint:** `/invoices/:id`
- **Method:** PUT
- **Body:** Same as Create Invoice

### Delete Invoice
- **Endpoint:** `/invoices/:id`
- **Method:** DELETE

## Stock In

### Get All Stock Ins
- **Endpoint:** `/stockins`
- **Method:** GET
- **Query Parameters:**
  - page (optional)
  - limit (optional)
  - search (optional)
  - startDate (optional)
  - endDate (optional)

### Create Stock In
- **Endpoint:** `/stockins`
- **Method:** POST
- **Body:**
```json
{
  "supplierId": "string",
  "items": [
    {
      "productId": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "total": "number",
  "status": "string"
}
```

### Get Stock In by ID
- **Endpoint:** `/stockins/:id`
- **Method:** GET

### Update Stock In
- **Endpoint:** `/stockins/:id`
- **Method:** PUT
- **Body:** Same as Create Stock In

### Delete Stock In
- **Endpoint:** `/stockins/:id`
- **Method:** DELETE

## Suppliers

### Get All Suppliers
- **Endpoint:** `/suppliers`
- **Method:** GET
- **Query Parameters:**
  - page (optional)
  - limit (optional)
  - search (optional)

### Create Supplier
- **Endpoint:** `/suppliers`
- **Method:** POST
- **Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string"
}
```

### Get Supplier by ID
- **Endpoint:** `/suppliers/:id`
- **Method:** GET

### Update Supplier
- **Endpoint:** `/suppliers/:id`
- **Method:** PUT
- **Body:** Same as Create Supplier

### Delete Supplier
- **Endpoint:** `/suppliers/:id`
- **Method:** DELETE

## Users

### Get All Users
- **Endpoint:** `/users`
- **Method:** GET
- **Query Parameters:**
  - page (optional)
  - limit (optional)
  - search (optional)

### Create User
- **Endpoint:** `/users`
- **Method:** POST
- **Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "string"
}
```

### Get User by ID
- **Endpoint:** `/users/:id`
- **Method:** GET

### Update User
- **Endpoint:** `/users/:id`
- **Method:** PUT
- **Body:**
```json
{
  "name": "string",
  "email": "string",
  "role": "string"
}
```

### Delete User
- **Endpoint:** `/users/:id`
- **Method:** DELETE

## Promotions

### Get All Promotions
- **Endpoint:** `/promotions`
- **Method:** GET
- **Query Parameters:**
  - page (optional)
  - limit (optional)
  - search (optional)
  - isActive (optional)

### Create Promotion
- **Endpoint:** `/promotions`
- **Method:** POST
- **Body:**
```json
{
  "name": "string",
  "description": "string",
  "discountType": "percentage | fixed",
  "discountValue": "number",
  "startDate": "date",
  "endDate": "date",
  "conditions": {
    "minPurchase": "number",
    "applicableProducts": ["string"]
  }
}
```

### Get Promotion by ID
- **Endpoint:** `/promotions/:id`
- **Method:** GET

### Update Promotion
- **Endpoint:** `/promotions/:id`
- **Method:** PUT
- **Body:** Same as Create Promotion

### Delete Promotion
- **Endpoint:** `/promotions/:id`
- **Method:** DELETE

## Post Offices

### Get All Post Offices
- **Endpoint:** `/post-offices`
- **Method:** GET
- **Query Parameters:**
  - page (optional)
  - limit (optional)
  - search (optional)

### Create Post Office
- **Endpoint:** `/post-offices`
- **Method:** POST
- **Body:**
```json
{
  "name": "string",
  "address": "string",
  "phone": "string",
  "email": "string"
}
```

### Get Post Office by ID
- **Endpoint:** `/post-offices/:id`
- **Method:** GET

### Update Post Office
- **Endpoint:** `/post-offices/:id`
- **Method:** PUT
- **Body:** Same as Create Post Office

### Delete Post Office
- **Endpoint:** `/post-offices/:id`
- **Method:** DELETE

## Shipments

### Get All Shipments
- **Endpoint:** `/shipments`
- **Method:** GET
- **Query Parameters:**
  - page (optional)
  - limit (optional)
  - search (optional)
  - status (optional)

### Create Shipment
- **Endpoint:** `/shipments`
- **Method:** POST
- **Body:**
```json
{
  "invoiceId": "string",
  "postOfficeId": "string",
  "trackingNumber": "string",
  "status": "string",
  "estimatedDeliveryDate": "date",
  "shippingAddress": {
    "street": "string",
    "city": "string",
    "state": "string",
    "postalCode": "string",
    "country": "string"
  }
}
```

### Get Shipment by ID
- **Endpoint:** `/shipments/:id`
- **Method:** GET

### Update Shipment
- **Endpoint:** `/shipments/:id`
- **Method:** PUT
- **Body:** Same as Create Shipment

### Delete Shipment
- **Endpoint:** `/shipments/:id`
- **Method:** DELETE

## Common Features

### All GET endpoints support:
- Pagination
- Searching
- Filtering
- Sorting

### Authentication:
- All endpoints except `/auth/login` and `/auth/forgot-password` require authentication
- Include token in Authorization header: `Bearer <token>`

### Error Responses:
```json
{
  "error": "string",
  "details": "string (optional)"
}
```

### Success Responses:
```json
{
  "data": "object | array",
  "meta": {
    "page": "number",
    "limit": "number",
    "total": "number"
  }
}
