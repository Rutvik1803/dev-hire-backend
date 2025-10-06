import { prisma } from '../../config/prisma';
import { hashPassword, comparePassword, createTokens } from '../../utils/auth';
import { ConflictError, UnauthorizedError, BadRequestError } from '../../utils/customErrors';

// Create a type for user data
export type UserData = {
  email: string;
  name: string;
  password: string;
};

// Create a type for login data
export type LoginData = {
  email: string;
  password: string;
};

// Service for Sign Up
export const signUp = async (userData: UserData) => {
  // Validate input
  if (!userData.email || !userData.name || !userData.password) {
    throw BadRequestError('Email, name, and password are required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    throw BadRequestError('Invalid email format');
  }

  // Validate password strength (minimum 6 characters)
  if (userData.password.length < 6) {
    throw BadRequestError('Password must be at least 6 characters long');
  }

  // First look if the user already exists
  const existing = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  // If user exists, throw an error
  if (existing) {
    throw ConflictError('User already exists');
  }

  // Hash the password before storing it
  const hashedPassword = await hashPassword(userData.password);

  // If user does not exist, create a new user
  const user = await prisma.user.create({
    // we have to modify the data along with the hashed password and role as USER
    data: { ...userData, password: hashedPassword, role: 'USER' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Generate tokens
  const { accessToken, refreshToken } = createTokens(user.id, user.role);

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

// Service for Login
export const login = async (loginData: LoginData) => {
  // Validate input
  if (!loginData.email || !loginData.password) {
    throw BadRequestError('Email and password are required');
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: loginData.email },
  });

  // If user does not exist, throw an error
  if (!user) {
    throw UnauthorizedError('Invalid email or password');
  }

  // Compare password
  const isPasswordValid = await comparePassword(loginData.password, user.password);

  // If password is invalid, throw an error
  if (!isPasswordValid) {
    throw UnauthorizedError('Invalid email or password');
  }

  // Generate tokens
  const { accessToken, refreshToken } = createTokens(user.id, user.role);

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  // Return user data without password
  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};
