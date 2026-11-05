import { getAuthHeader } from '@/lib/firebase-auth-header';

export async function withAuth<T>(fn: (headers: Record<string, string>) => Promise<T>): Promise<T> {
  const headers = await getAuthHeader();
  return fn(headers);
}