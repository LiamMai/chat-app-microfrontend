import { Route } from '@angular/router';
import { RemoteEntryComponent } from './entry';
import { AddFriendsComponent } from './add-friends/add-friends.component';
import { FriendRequestsComponent } from './friend-requests/friend-requests.component';
import { ROUTE_SEGMENTS } from '../utils/routes';

export const remoteRoutes: Route[] = [
  {
    path: '',
    component: RemoteEntryComponent,
    children: [
      { path: '', redirectTo: ROUTE_SEGMENTS.ADD_FRIENDS, pathMatch: 'full' },
      { path: ROUTE_SEGMENTS.ADD_FRIENDS, component: AddFriendsComponent },
      { path: ROUTE_SEGMENTS.REQUESTS,    component: FriendRequestsComponent },
    ],
  },
];
