import { User } from '@prisma/client';

/**
 * Exclude sensitive fields from user object
 * @param user - User object from database
 * @param keys - Array of keys to exclude (default: ['password'])
 * @returns User object without sensitive fields
 */
export const excludeUserFields = <T extends Partial<User>, K extends keyof T>(
    user: T,
    keys: K[] = ['password' as K],
): Omit<T, K> => {
    const userCopy = { ...user };
    for (const key of keys) {
        delete userCopy[key];
    }
    return userCopy;
};

/**
 * Format user response for API responses
 * @param user - User object from database
 * @returns Sanitized user object
 */
export const formatUserResponse = (user: User) => {
    return excludeUserFields(user, ['password']);
};
