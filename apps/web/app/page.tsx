import { HomePage } from '@/components/portfolio/home-page';
import { getHomeBundle } from '@/services/public';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const bundle = await getHomeBundle();
  return <HomePage {...bundle} />;
}
