import { uniq } from 'lodash';

import { SerializedCanvasDocument } from '../types';
import { UserProfile } from '../UserProfileProvider';

import { useUserProfilesByIds } from './use-query/useUserProfilesByIds';

const isValidString = (str: string | undefined): str is string =>
  typeof str === 'string' && str.trim().length > 0;

type UseCanvasesWithUserProfilesProps = {
  canvases: SerializedCanvasDocument[];
};

export type CanvasDocumentWithUserProfile = SerializedCanvasDocument & {
  createdByUserProfile: UserProfile | undefined;
  updatedByUserProfile: UserProfile | undefined;
  createdAtDate: Date;
  updatedAtDate: Date;
};

export type UseCanvasesWithUserProfilesReturnType = {
  canvasesWithUserProfiles: CanvasDocumentWithUserProfile[];
};

const useCanvasesWithUserProfiles = ({
  canvases,
}: UseCanvasesWithUserProfilesProps) => {
  const { userProfiles } = useUserProfilesByIds({
    userIdentifiers: uniq(
      canvases
        .flatMap((canvas) => [canvas.createdBy, canvas.updatedBy])
        .filter(isValidString)
    ),
  });

  const canvasesWithUserProfiles = canvases.map(
    (canvas): CanvasDocumentWithUserProfile => ({
      ...canvas,
      createdByUserProfile: userProfiles.find(
        (userProfile) => userProfile.userIdentifier === canvas.createdBy
      ),
      updatedByUserProfile: userProfiles.find(
        (userProfile) => userProfile.userIdentifier === canvas.updatedBy
      ),
      createdAtDate: new Date(canvas.createdTime),
      updatedAtDate: new Date(canvas.updatedAt),
    })
  );

  return {
    canvasesWithUserProfiles,
  };
};

export default useCanvasesWithUserProfiles;
