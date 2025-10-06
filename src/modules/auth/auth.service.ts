import { prisma } from '../../config/prisma';
import { hashPassword } from '../../utils/auth';

//Create a type for user data
export type UserData = {
  email: string;
  name: string;
  password: string;
};

// Service for Sign Up
export const signUp = async (userData: UserData) => {
  // First look if the user already exists
  const existing = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  // If user exists, throw an error
  if (existing) {
    class HttpError extends Error {
      status: number;
      constructor(message: string, status: number) {
        super(message);
        this.status = status;
      }
    }
    throw new HttpError('User already exists', 400);
  }

  // Hash the password before storing it
  const hashedPassword = await hashPassword(userData.password);

  // If user does not exist, create a new user
  const user = await prisma.user.create({
    // we have to modify the data along with the hashed password and role as ADMIN
    data: { ...userData, password: hashedPassword, role: 'ADMIN' },
  });

  return user;
};
