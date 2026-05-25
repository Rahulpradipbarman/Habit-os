import { getCurrentUserId } from '@/app/actions/auth';
import HomePageClient from './HomePageClient';

export default async function Home() {
  const userId = await getCurrentUserId();
  
  return <HomePageClient initialIsLoggedIn={!!userId} />;
}
