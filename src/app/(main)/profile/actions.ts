'use server';

import crypto from 'crypto';

/**
 * Generates a secure, random stream key.
 * This is a server action and can only be executed on the server.
 */
export async function generateStreamKey(): Promise<string> {
    return crypto.randomBytes(32).toString('hex');
}
