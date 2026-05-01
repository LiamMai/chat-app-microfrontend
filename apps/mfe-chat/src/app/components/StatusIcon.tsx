import {
  IconCheck,
  IconChecks,
  IconPin,
} from '@tabler/icons-react';
import type { Conversation } from '../data/mock';

interface StatusIconProps {
  statusIcon?: Conversation['statusIcon'];
  unread?: number;
}

export function StatusIcon({ statusIcon, unread }: StatusIconProps) {
  if (unread && unread > 0) {
    return (
      <span
        style={{
          background: '#4d7af6',
          color: '#fff',
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 700,
          padding: '1px 7px',
          minWidth: 20,
          textAlign: 'center',
          display: 'inline-block',
        }}
      >
        {unread}
      </span>
    );
  }

  if (statusIcon === 'double-check') {
    return <IconChecks size={16} color="#4d7af6" />;
  }

  if (statusIcon === 'single-check') {
    return <IconCheck size={16} color="#8b9dc3" />;
  }

  if (statusIcon === 'pin') {
    return <IconPin size={14} color="#8b9dc3" />;
  }

  return null;
}
