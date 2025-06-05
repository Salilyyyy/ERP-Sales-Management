const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: ['error', 'warn'],
  transactionOptions: {
    maxWait: 30000,  
    timeout: 30000   
  }
});

process.on('beforeExit', async () => {
  console.log('💡 Prisma Client is shutting down');
  await prisma.$disconnect();
});

prisma.$use(async (params, next) => {
  const maxRetries = 2;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await next(params);
    } catch (error) {
      retries++;
      
      if (error.code === 'P1017' || error.code === 'P1001' || error.code === 'P1002') {
        console.log(`Database connection error, attempt ${retries} of ${maxRetries}`);
        
        if (retries === maxRetries) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
        
        try {
          await prisma.$connect();
        } catch (reconnectError) {
          console.error('Failed to reconnect:', reconnectError);
        }
        
        continue;
      }
      
      throw error;
    }
  }
});

async function checkConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection health check failed:', error);
    return false;
  }
}

const healthCheckInterval = setInterval(async () => {
  const isHealthy = await checkConnection();
  if (!isHealthy) {
    console.log('Attempting to reconnect to database...');
    try {
      await prisma.$connect();
      console.log('Successfully reconnected to database');
    } catch (error) {
      console.error('Failed to reconnect:', error);
    }
  }
}, 30000); 

process.on('SIGTERM', () => {
  clearInterval(healthCheckInterval);
});

module.exports = prisma;
