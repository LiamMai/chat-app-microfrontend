'use client';

import dynamic from 'next/dynamic';
import { ROUTES } from '@/lib/constants';

const AngularMfePortal = dynamic(() => import('./AngularMfePortal'), {
  ssr: false,
});

interface Props {
  basePath?: string;
}

export function AngularMfeHost({ basePath = ROUTES.CONTACTS }: Props) {
  return <AngularMfePortal basePath={basePath} />;
}
