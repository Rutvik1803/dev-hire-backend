import { prisma } from '../../config/prisma';
import { hashPassword, comparePassword, createTokens } from '../../utils/auth';
import { ConflictError, UnauthorizedError, BadRequestError } from '../../utils/customErrors';
import { Role } from '@prisma/client';

// Create a type for user data
export type UserData = {
  email: string;
  name: string;
  password: string;
  role: Role; // Added role
};

// Create a type for login data
export type LoginData = {
  email: string;
  password: string;
  role: Role; // Added role
};

// Service for Sign Up
export const signUp = async (userData: UserData) => {
  // Validate input
  if (!userData.email || !userData.name || !userData.password || !userData.role) {
    throw BadRequestError('Email, name, password, and role are required');
  }

  // Validate role (only DEVELOPER or RECRUITER allowed for signup)
  if (userData.role !== Role.DEVELOPER && userData.role !== Role.RECRUITER) {
    throw BadRequestError('Invalid role. Only DEVELOPER or RECRUITER allowed for signup');
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

  // If user does not exist, create a new user with the selected role
  const user = await prisma.user.create({
    data: {
      email: userData.email,
      name: userData.name,
      password: hashedPassword,
      role: userData.role
    },
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
  if (!loginData.email || !loginData.password || !loginData.role) {
    throw BadRequestError('Email, password, and role are required');
  }

  // Validate role
  if (loginData.role !== Role.DEVELOPER && loginData.role !== Role.RECRUITER && loginData.role !== Role.ADMIN) {
    throw BadRequestError('Invalid role');
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: loginData.email },
  });

  // If user does not exist, throw an error
  if (!user) {
    throw UnauthorizedError('Invalid email, password, or role');
  }

  // Check if role matches
  if (user.role !== loginData.role) {
    throw UnauthorizedError('Invalid email, password, or role');
  }

  // Compare password
  const isPasswordValid = await comparePassword(loginData.password, user.password);

  // If password is invalid, throw an error
  if (!isPasswordValid) {
    throw UnauthorizedError('Invalid email, password, or role');
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
