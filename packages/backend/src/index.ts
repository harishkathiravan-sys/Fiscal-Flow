import app from './app';
import { env } from './config/env';

const start = async () => {
  try {
    // Verify database connection
    const { prisma } = await import('./config/database');
    await prisma.$connect();
    console.log('✅ Database connected');

    // Start server
    app.listen(env.PORT, () => {
      console.log(`🚀 FiscalFlow API running on http://localhost:${env.PORT}`);
      console.log(`📌 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  const { prisma } = await import('./config/database');
  await prisma.$disconnect();
  process.exit(0);
});

start();
