'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSupporterBadgeVisibility, setSupporterBadgeVisibility } from '@/lib/loyalty';

export interface UseSupporterBadgeVisibilityResult {
  /** Whether the supporter's badge profile is visible to creators publicly. */
  isPublic: boolean;
  /** Update the opt-in preference. No-op for signed-out supporters. */
  setPublic: (visible: boolean) => void;
  /** False when there is no signed-in supporter to store a preference for. */
  canOptIn: boolean;
}

/**
 * Manage a supporter's opt-in/opt-out for showing their badge on the public
 * supporter profile.
 */
export function useSupporterBadgeVisibility(
  supporterId: string | null | undefined
): UseSupporterBadgeVisibilityResult {
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    try {
      setIsPublic(getSupporterBadgeVisibility(supporterId));
    } catch {
      // Ensure the visibility state is not left in a stale state on error.
      setIsPublic(false);
    }
  }, [supporterId]);

  const setPublic = useCallback(
    (visible: boolean): void => {
      if (!supporterId) return;
      try {
        setSupporterBadgeVisibility(supporterId, visible);
        setIsPublic(visible);
      } catch {
        // Revert to the previous value so the UI reflects the failed update.
        setIsPublic(getSupporterBadgeVisibility(supporterId));
      }
    },
    [supporterId]
  );

  return { isPublic, setPublic, canOptIn: Boolean(supporterId) };
}
