export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  avatarBg: string;
  lastMessage: string;
  time: string;
  unread?: number;
  isGroup?: boolean;
  isOnline?: boolean;
  statusIcon?: 'double-check' | 'single-check' | 'pin';
}

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
  reaction?: string;
}

export interface StoryContact {
  id: string;
  name: string;
  avatar: string;
  avatarBg: string;
  isOnline: boolean;
}

export const conversations: Conversation[] = [
  {
    id: '1',
    name: 'Design Nexus',
    avatar: 'DN',
    avatarBg: '#4d7af6',
    lastMessage: 'The final prototypes are ready f...',
    time: '14:20',
    unread: 2,
    isGroup: true,
    isOnline: false,
    statusIcon: undefined,
  },
  {
    id: '2',
    name: 'Arthur Morgan',
    avatar: 'AM',
    avatarBg: '#7c3aed',
    lastMessage: 'Catch you at the meeting tomorr...',
    time: 'Yesterday',
    isOnline: true,
    statusIcon: 'double-check',
  },
  {
    id: '3',
    name: 'Project Alpha Team',
    avatar: 'PA',
    avatarBg: '#059669',
    lastMessage: 'Sarah: Just uploaded the docs.',
    time: 'Monday',
    isGroup: true,
    isOnline: false,
    statusIcon: 'double-check',
  },
  {
    id: '4',
    name: 'Lana Chen',
    avatar: 'LC',
    avatarBg: '#db2777',
    lastMessage: "That's amazing news! Congrats!",
    time: 'Aug 12',
    isOnline: false,
    statusIcon: 'single-check',
  },
  {
    id: '5',
    name: 'Marcus Bell',
    avatar: 'MB',
    avatarBg: '#d97706',
    lastMessage: 'Shared a file: contract_final_rev.p',
    time: 'Aug 10',
    isOnline: false,
    statusIcon: 'pin',
  },
];

export const messages: Message[] = [
  {
    id: '1',
    text: 'Hey! Have you had a chance to review the Q4 roadmap I sent over this morning?',
    sender: 'them',
    time: '10:12 AM',
  },
  {
    id: '2',
    text: 'Just finished reading it. The focus on AI integration for the mobile app is definitely the right move. I have a few suggestions on the timeline though.',
    sender: 'me',
    time: '10:14 AM',
  },
  {
    id: '3',
    text: "Great. I'm free at 2 PM if you want to hop on a quick call to discuss the timeline adjustments.",
    sender: 'them',
    time: '10:15 AM',
    reaction: '👍 1',
  },
];

export const storyContacts: StoryContact[] = [
  {
    id: '1',
    name: 'Arthur',
    avatar: 'AM',
    avatarBg: '#7c3aed',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Lana',
    avatar: 'LC',
    avatarBg: '#db2777',
    isOnline: true,
  },
  {
    id: '3',
    name: 'Marcus',
    avatar: 'MB',
    avatarBg: '#d97706',
    isOnline: false,
  },
];
