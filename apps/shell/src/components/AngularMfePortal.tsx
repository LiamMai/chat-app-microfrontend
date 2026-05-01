'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface MfeMount {
  navigate: (path: string) => void;
  destroy: () => void;
}

const REMOTE_ENTRY =
  process.env.NEXT_PUBLIC_MFE_CONTACTS_URL
    ? `${process.env.NEXT_PUBLIC_MFE_CONTACTS_URL}/remoteEntry.js`
    : 'http://localhost:4202/remoteEntry.js';

// Module-level singletons — Angular app survives React unmounts
let _el: HTMLDivElement | null = null;
let _mount: MfeMount | null = null;
let _mountPromise: Promise<MfeMount> | null = null;

async function getMountFn(): Promise<(el: HTMLElement, basePath?: string) => Promise<MfeMount>> {
  if (!(window as unknown as Record<string, unknown>)['mfe_contacts']) {
    const code = await fetch(REMOTE_ENTRY).then((r) => {
      if (!r.ok) throw new Error(`Failed to fetch ${REMOTE_ENTRY}: ${r.status}`);
      return r.text();
    });
    // eslint-disable-next-line no-eval
    (0, eval)(code);
  }
  const container = (window as Record<string, any>)['mfe_contacts'];
  if (!container) throw new Error('mfe_contacts container not found — is localhost:4202 running?');
  try { await container.init({}); } catch { /* already initialized */ }
  const factory = await container.get('./Mount');
  if (!factory) throw new Error('mfe_contacts does not expose ./Mount');
  return factory().mount;
}

function getPersistentEl(): HTMLDivElement {
  if (!_el) {
    _el = document.createElement('div');
    _el.style.cssText = 'width:100%;height:100%;';
  }
  return _el;
}

export default function AngularMfePortal({ basePath }: { basePath: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    const wrapper = wrapperRef.current!;
    const el = getPersistentEl();
    wrapper.appendChild(el);

    if (_mount) {
      // Already bootstrapped — navigate immediately
      _mount.navigate(pathnameRef.current);
    } else {
      if (!_mountPromise) {
        _mountPromise = getMountFn()
          .then((mount) => mount(el, basePath))
          .then((mfe) => { _mount = mfe; return mfe; })
          .catch((err) => { _mountPromise = null; console.error(err); throw err; });
      }
      _mountPromise.then((mfe) => mfe.navigate(pathnameRef.current)).catch(console.error);
    }

    return () => {
      // Detach without destroying — Angular state persists for next visit
      el.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={wrapperRef} style={{ width: '100%', height: '100%' }} />;
}
