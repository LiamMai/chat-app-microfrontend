import { AngularMfeHost } from '@/components/AngularMfeHost';
import { ROUTES } from '@/lib/constants';

export default function ContactsPage() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <AngularMfeHost basePath={ROUTES.CONTACTS} />
    </div>
  );
}
