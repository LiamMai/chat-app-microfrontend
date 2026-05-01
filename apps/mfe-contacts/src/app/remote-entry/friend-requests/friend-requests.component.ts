import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { navigateTo } from '../../utils/navigate';
import { ROUTES } from '../../utils/routes';

export interface FriendRequest {
  id: number;
  name: string;
  subtitle: string;
  initials: string;
  avatarColor: string;
  accepted: boolean | null; // null = pending
}

export interface Suggestion {
  id: number;
  name: string;
  subtitle: string;
  initials: string;
  avatarColor: string;
  requested: boolean;
}

export interface Friend {
  id: number;
  name: string;
  status: 'online' | 'away' | 'offline';
  statusLabel: string;
  initials: string;
  avatarColor: string;
}

@Component({
  selector: 'app-friend-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './friend-requests.component.html',
  styleUrls: ['./friend-requests.component.scss'],
})
export class FriendRequestsComponent {
  friendSearchQuery = signal('');
  desktopSearchQuery = signal('');

  friendRequests = signal<FriendRequest[]>([
    {
      id: 1,
      name: 'Daniel Kim',
      subtitle: '12 mutual friends',
      initials: 'DK',
      avatarColor: '#4d7af6',
      accepted: null,
    },
    {
      id: 2,
      name: 'Aisha Okonkwo',
      subtitle: 'Works at Stripe',
      initials: 'AO',
      avatarColor: '#9333ea',
      accepted: null,
    },
    {
      id: 3,
      name: 'Lucas Mendes',
      subtitle: '5 mutual friends',
      initials: 'LM',
      avatarColor: '#16a34a',
      accepted: null,
    },
    {
      id: 4,
      name: 'Yuki Tanaka',
      subtitle: 'Studied at MIT',
      initials: 'YT',
      avatarColor: '#dc2626',
      accepted: null,
    },
  ]);

  suggestions = signal<Suggestion[]>([
    {
      id: 1,
      name: 'Carlos Vega',
      subtitle: '8 mutual friends',
      initials: 'CV',
      avatarColor: '#ea580c',
      requested: false,
    },
    {
      id: 2,
      name: 'Sophie Müller',
      subtitle: '3 mutual friends',
      initials: 'SM',
      avatarColor: '#0891b2',
      requested: false,
    },
    {
      id: 3,
      name: 'Kwame Asante',
      subtitle: 'Works at Figma',
      initials: 'KA',
      avatarColor: '#7c3aed',
      requested: true,
    },
    {
      id: 4,
      name: 'Elena Popescu',
      subtitle: '15 mutual friends',
      initials: 'EP',
      avatarColor: '#be185d',
      requested: false,
    },
    {
      id: 5,
      name: 'Omar Hassan',
      subtitle: 'Studied at Cornell',
      initials: 'OH',
      avatarColor: '#065f46',
      requested: false,
    },
  ]);

  friends = signal<Friend[]>([
    {
      id: 1,
      name: 'Alex Rivera',
      status: 'online',
      statusLabel: 'Active Now',
      initials: 'AR',
      avatarColor: '#4d7af6',
    },
    {
      id: 2,
      name: 'Sarah Chen',
      status: 'offline',
      statusLabel: 'Last seen 2h ago',
      initials: 'SC',
      avatarColor: '#9333ea',
    },
    {
      id: 3,
      name: 'Marcus Johnson',
      status: 'away',
      statusLabel: 'Away',
      initials: 'MJ',
      avatarColor: '#16a34a',
    },
    {
      id: 4,
      name: 'Priya Sharma',
      status: 'online',
      statusLabel: 'Active Now',
      initials: 'PS',
      avatarColor: '#dc2626',
    },
  ]);

  get pendingRequests(): FriendRequest[] {
    return this.friendRequests().filter((r) => r.accepted === null);
  }

  get pendingCount(): number {
    return this.pendingRequests.length;
  }

  get filteredFriends(): Friend[] {
    const q = this.friendSearchQuery().toLowerCase();
    if (!q) return this.friends();
    return this.friends().filter((f) => f.name.toLowerCase().includes(q));
  }

  acceptRequest(id: number): void {
    this.friendRequests.update((reqs) =>
      reqs.map((r) => (r.id === id ? { ...r, accepted: true } : r))
    );
  }

  declineRequest(id: number): void {
    this.friendRequests.update((reqs) =>
      reqs.map((r) => (r.id === id ? { ...r, accepted: false } : r))
    );
  }

  toggleSuggestionRequest(id: number): void {
    this.suggestions.update((sug) =>
      sug.map((s) => (s.id === id ? { ...s, requested: !s.requested } : s))
    );
  }

  getStatusDotColor(status: Friend['status']): string {
    switch (status) {
      case 'online':
        return '#22c55e';
      case 'away':
        return '#f59e0b';
      case 'offline':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  }

  readonly ROUTES = ROUTES;

  navigate(path: string): void {
    navigateTo(path);
  }
}
