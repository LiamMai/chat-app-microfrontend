import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { navigateTo } from '../../utils/navigate';
import { ROUTES } from '../../utils/routes';

export interface SuggestedUser {
  id: number;
  name: string;
  username: string;
  initials: string;
  avatarColor: string;
  mutualCount: number;
  isOnline: boolean;
  requestSent: boolean;
}

export interface RecentSearch {
  id: number;
  label: string;
}

@Component({
  selector: 'app-add-friends',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './add-friends.component.html',
  styleUrls: ['./add-friends.component.scss'],
})
export class AddFriendsComponent {
  searchQuery = signal('');

  recentSearches = signal<RecentSearch[]>([
    { id: 1, label: 'Alex Rivera' },
    { id: 2, label: 'Designer Squad' },
    { id: 3, label: 'Sarah Che...' },
    { id: 4, label: 'Dev Team' },
  ]);

  suggestedUsers = signal<SuggestedUser[]>([
    {
      id: 1,
      name: 'Alex Rivera',
      username: 'alexrivera',
      initials: 'AR',
      avatarColor: '#4d7af6',
      mutualCount: 12,
      isOnline: true,
      requestSent: false,
    },
    {
      id: 2,
      name: 'Sarah Chen',
      username: 'sarahchen',
      initials: 'SC',
      avatarColor: '#9333ea',
      mutualCount: 8,
      isOnline: true,
      requestSent: false,
    },
    {
      id: 3,
      name: 'Marcus Johnson',
      username: 'marcusj',
      initials: 'MJ',
      avatarColor: '#16a34a',
      mutualCount: 5,
      isOnline: false,
      requestSent: true,
    },
    {
      id: 4,
      name: 'Priya Sharma',
      username: 'priyasharma',
      initials: 'PS',
      avatarColor: '#dc2626',
      mutualCount: 15,
      isOnline: true,
      requestSent: false,
    },
    {
      id: 5,
      name: 'Jordan Lee',
      username: 'jordanlee',
      initials: 'JL',
      avatarColor: '#ea580c',
      mutualCount: 3,
      isOnline: false,
      requestSent: false,
    },
    {
      id: 6,
      name: 'Nina Patel',
      username: 'ninapatel',
      initials: 'NP',
      avatarColor: '#0891b2',
      mutualCount: 9,
      isOnline: true,
      requestSent: false,
    },
  ]);

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  removeRecentSearch(id: number): void {
    this.recentSearches.update((searches) =>
      searches.filter((s) => s.id !== id)
    );
  }

  clearAllRecentSearches(): void {
    this.recentSearches.set([]);
  }

  toggleRequest(userId: number): void {
    this.suggestedUsers.update((users) =>
      users.map((u) =>
        u.id === userId ? { ...u, requestSent: !u.requestSent } : u
      )
    );
  }

  // First 3 users shown in the mobile card grid
  get mobileSuggestedUsers(): SuggestedUser[] {
    return this.suggestedUsers().slice(0, 3);
  }

  readonly ROUTES = ROUTES;

  navigate(path: string): void {
    navigateTo(path);
  }
}
