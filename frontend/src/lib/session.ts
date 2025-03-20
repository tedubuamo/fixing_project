import { cookies } from 'next/headers';

export async function getSession() {
  const cookieStore = cookies();
  const session = cookieStore.get('session');
  
  if (!session) {
    return null;
  }

  try {
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}