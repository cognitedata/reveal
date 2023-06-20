import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { QueryKeys } from '../constants';
import { IndustryCanvasService } from '../services/IndustryCanvasService';
import { UserProfile } from '../UserProfileProvider';

const LOCK_TIMEOUT_MS = 120 * 1000;
const REFETCH_INTERVAL_MS = 30 * 1000;

const msAgo = (updatedAt: string): number => {
  return dayjs().diff(updatedAt, 'ms');
};

const useCanvasLocking = (
  canvasId: string | undefined,
  canvasService: IndustryCanvasService,
  userProfile: UserProfile
) => {
  const { data } = useQuery(
    [QueryKeys.LOCKING, canvasId],
    async (): Promise<boolean> => {
      if (canvasId === undefined) {
        return false;
      }

      const metadata = await canvasService.getCanvasMetadataById(canvasId);
      if (metadata.updatedBy === userProfile.userIdentifier) {
        return false;
      }

      if (msAgo(metadata.updatedAt) > LOCK_TIMEOUT_MS) {
        return false;
      }

      return true;
    },
    {
      enabled: canvasId !== undefined,
      refetchInterval: REFETCH_INTERVAL_MS,
      initialData: false,
    }
  );

  return {
    isCanvasLocked: data,
  };
};

export default useCanvasLocking;
