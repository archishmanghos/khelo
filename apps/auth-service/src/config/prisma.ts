import { PrismaClient, AuthProvider, Role } from '../../prisma/client';

const prisma = new PrismaClient();

export { AuthProvider, Role };
export default prisma;



