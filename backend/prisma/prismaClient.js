const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  transactionOptions: {
    maxWait: 120000, 
    timeout: 120000  
  }
});

module.exports = prisma;
