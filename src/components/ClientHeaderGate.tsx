'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';

export default function ClientHeaderGate() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  if (isHome) return null;

  // Renderiza o Header e um espaçador equivalente à altura do header fixo
  return (
    <>
      <Header />
      <div style={{ height: '5rem' }} aria-hidden /> {/* ~80px = pt-20 */}
    </>
  );
}
