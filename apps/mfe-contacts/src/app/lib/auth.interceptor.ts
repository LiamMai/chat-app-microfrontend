import {
  HttpClient,
  HttpContextToken,
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpBackend,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';

const AUTH_REFRESH_PATH = '/api/auth/refresh';
const LOGIN_PATH = '/login';
const AUTH_RETRY = new HttpContextToken<boolean>(() => false);

let inflightRefresh: Observable<boolean> | null = null;

function isShellApiRequest(url: string): boolean {
  return url.startsWith('/api/');
}

function redirectToLogin(): void {
  const from = window.location.pathname + window.location.search;
  window.location.assign(`${LOGIN_PATH}?from=${encodeURIComponent(from)}`);
}

function refreshTokens(handler: HttpBackend): Observable<boolean> {
  if (!inflightRefresh) {
    const http = new HttpClient(handler);
    inflightRefresh = http
      .post<unknown>(AUTH_REFRESH_PATH, {}, { withCredentials: true })
      .pipe(
        map(() => true),
        catchError(() => of(false)),
        finalize(() => {
          inflightRefresh = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
  }

  return inflightRefresh;
}

function attachCredentials(req: HttpRequest<unknown>): HttpRequest<unknown> {
  return isShellApiRequest(req.url)
    ? req.clone({ withCredentials: true })
    : req;
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const backend = inject(HttpBackend);
  const authedReq = attachCredentials(req);

  return next(authedReq).pipe(
    catchError((error: unknown) => {
      const shouldRefresh =
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        isShellApiRequest(authedReq.url) &&
        authedReq.url !== AUTH_REFRESH_PATH;

      if (!shouldRefresh) {
        return throwError(() => error);
      }

      if (authedReq.context.get(AUTH_RETRY)) {
        redirectToLogin();
        return throwError(() => error);
      }

      return refreshTokens(backend).pipe(
        switchMap((refreshed) => {
          if (!refreshed) {
            redirectToLogin();
            return throwError(() => error);
          }

          return next(
            authedReq.clone({
              context: authedReq.context.set(AUTH_RETRY, true),
            }),
          );
        }),
      );
    }),
  );
};
