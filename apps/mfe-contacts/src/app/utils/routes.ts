export const ROUTES = {
  CONTACTS_BASE:        '/contacts',
  MESSAGES:             '/',
  SETTINGS:             '/settings',
  CONTACTS_ADD_FRIENDS: '/contacts/add-friends',
  CONTACTS_REQUESTS:    '/contacts/requests',
} as const;

export const ROUTE_SEGMENTS = {
  ADD_FRIENDS: 'add-friends',
  REQUESTS:    'requests',
} as const;
