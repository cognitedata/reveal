import { UserProfile } from '../../UserProfileProvider';
import { CanvasVisibility } from '../IndustryCanvasService';

export const getVisibilityFilter = ({
  userProfile,
  visibilityFilter,
}: {
  userProfile: UserProfile;
  visibilityFilter: CanvasVisibility | undefined;
}) => {
  if (visibilityFilter === CanvasVisibility.PUBLIC) {
    return {
      visibility: {
        eq: CanvasVisibility.PUBLIC,
      },
    };
  }

  if (visibilityFilter === CanvasVisibility.PRIVATE) {
    return {
      and: [
        {
          or: [
            {
              visibility: {
                eq: CanvasVisibility.PRIVATE,
              },
            },
            // Note: If the visibility field of a canvas is undefined we show it as private in the all list,
            // It should also be showed under the private tab although the visibility value is not actually set!
            { visibility: { isNull: true } },
          ],
        },
        // When private, show me only the canvases that are created by me.
        { createdBy: { eq: userProfile.userIdentifier } },
      ],
    };
  }

  // Filter for 'ALL' case
  return {
    or: [
      {
        visibility: {
          eq: CanvasVisibility.PUBLIC,
        },
      },
      { createdBy: { eq: userProfile.userIdentifier } },
      // TODO: here we will add another filter for 'shared with me' canvases later.
    ],
  };
};
