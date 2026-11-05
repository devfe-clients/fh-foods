import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { auth } from '@/lib/firebase';

export const Route = createFileRoute('/_authenticated')({
  ssr: false,
  beforeLoad: async () => {
    await new Promise<void>((resolve) => {

        const unsubscribe = auth.onAuthStateChanged((_user: import('firebase/auth').User | null) => {
        unsubscribe();
        resolve();
      });
    });

    if (!auth.currentUser) {
      throw redirect({ to: '/auth' });
    }
  },
  component: Outlet,
});