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
          background: '#aac4f5',
          color: '#13233f',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 700,
          height: 22,
          minWidth: 22,
          padding: '0 6px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        {unread > 99 ? '99+' : unread}
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
