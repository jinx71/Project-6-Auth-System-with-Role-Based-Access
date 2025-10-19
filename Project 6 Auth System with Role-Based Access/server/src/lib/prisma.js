const { PrismaClient } = require('@prisma/client');

// Single shared client — avoids exhausting DB connections in dev hot-reload
const prisma = new PrismaClient();

module.exports = prisma;
