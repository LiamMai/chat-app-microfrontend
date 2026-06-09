import { ActionIcon, Indicator } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';

interface NotificationBellProps {
  /** Total badge count (unread messages + pending requests). */
  badgeCount: number;
  /** Open the full notifications page. */
  onOpen: () => void;
  iconSize?: number;
}

export function NotificationBell({ badgeCount, onOpen, iconSize = 18 }: NotificationBellProps) {
  const hasBadge = badgeCount > 0;

  return (
    <Indicator
      color="red"
      size={16}
      offset={4}
      disabled={!hasBadge}
      label={
        <span className="text-[10px] font-bold leading-none">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      }
    >
      <ActionIcon
        variant="subtle"
        size="lg"
        radius="md"
        aria-label={hasBadge ? `Notifications, ${badgeCount} new` : 'Notifications'}
        onClick={onOpen}
        color={hasBadge ? 'brand' : 'gray'}
      >
        <IconBell size={iconSize} />
      </ActionIcon>
    </Indicator>
  );
}
