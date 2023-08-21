import styled from 'styled-components';

import isArray from 'lodash/isArray';

import { translationKeys } from '../../common';
import { useUserProfilesByIds } from '../../hooks/use-query/useUserProfilesByIds';
import { useTranslation } from '../../hooks/useTranslation';
import { IndustryCanvasContextType } from '../../IndustryCanvasContext';
import { useUserProfile, UserProfile } from '../../UserProfileProvider';
import { SharedUsersList } from '../SharedUsersList';
import { UserSearchInput } from '../UserSearchInput';

type Props = Pick<IndustryCanvasContextType, 'activeCanvas'> & {
  selectedUsers: UserProfile[];
  onUserRemoved: (userId: string) => void;
  onUserSelected: (user: UserProfile) => void;
};

export const UserSearch = ({
  activeCanvas,
  selectedUsers,
  onUserRemoved,
  onUserSelected,
}: Props) => {
  const { t } = useTranslation();

  // Profile of the logged in user.
  const { userProfile } = useUserProfile();

  // Find the profile of the canvas owner using the activeCanvas.
  const { userProfiles } = useUserProfilesByIds({
    userIdentifiers: activeCanvas ? [activeCanvas.createdBy] : [],
  });
  const ownerProfile = isArray(userProfiles) ? userProfiles[0] : undefined;
  const isLoggedInUserOwnerOfTheCanvas =
    userProfile.userIdentifier === ownerProfile?.userIdentifier;

  return (
    <UserSearchWrapper>
      {isLoggedInUserOwnerOfTheCanvas && (
        <UserSearchInput
          onUserSelected={onUserSelected}
          placeholder={t(
            translationKeys.VISIBILITY_MODAL_USER_SEARCH_PLACEHOLDER,
            'Invite users to this canvas...'
          )}
          enableAuth2Users
        />
      )}
      <SharedUsersList
        ownerProfile={ownerProfile}
        sharedUsers={selectedUsers}
        onUserRemoved={onUserRemoved}
        enableUserRemoval={isLoggedInUserOwnerOfTheCanvas}
      />
    </UserSearchWrapper>
  );
};

const UserSearchWrapper = styled.div`
  width: 100%;
`;
