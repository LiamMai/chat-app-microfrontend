import { APP_BASE_HREF } from '@angular/common';
import { Router } from '@angular/router';
import { ROUTES } from './app/utils/routes';

export interface MfeMount {
  navigate: (path: string) => void;
  destroy: () => void;
}

// webpack sets this to the correct public path at runtime (e.g. http://localhost:4202/)
declare let __webpack_public_path__: string;

function injectStylesheet(href: string): void {
  if (document.querySelector(`link[data-mfe-contacts][href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset['mfeContacts'] = '1';
  document.head.appendChild(link);
}

function removeStylesheet(href: string): void {
  document.querySelector(`link[data-mfe-contacts][href="${href}"]`)?.remove();
}

export async function mount(
  container: HTMLElement,
  basePath = ROUTES.CONTACTS_BASE
): Promise<MfeMount> {
  const stylesHref = `${__webpack_public_path__}styles.css`;
  injectStylesheet(stylesHref);

  const { bootstrapApplication } = await import('@angular/platform-browser');
  const { AppComponent } = await import('./app/app.component');
  const { appConfig } = await import('./app/app.config');

  const el = document.createElement('app-mfe_contacts-entry');
  container.appendChild(el);

  const appRef = await bootstrapApplication(AppComponent, {
    ...appConfig,
    providers: [
      ...appConfig.providers,
      { provide: APP_BASE_HREF, useValue: basePath },
    ],
  });

  const router = appRef.injector.get(Router);

  return {
    navigate: (path: string) => {
      const relative = path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
      router.navigateByUrl(relative);
    },
    destroy: () => {
      appRef.destroy();
      container.innerHTML = '';
      removeStylesheet(stylesHref);
    },
  };
}
