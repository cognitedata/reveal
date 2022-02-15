import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import noop from 'lodash/noop';
import { UserProfileUpdateQueryData } from 'services/user/types';
import { useUserProfileQuery } from 'services/user/useUserQuery';
import { convertToCancellablePromise } from 'utils/cancellablePromise';

import { Button, Input } from '@cognite/cogs.js';
import { LogoutButton } from '@cognite/react-container';

import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import {
  AvatarAndEmailContainer,
  CompanyInfoContainer,
  CompanyLabel,
  EmailContainer,
  InputFieldContainer,
  LogOutButtonContainer,
  SaveButtonContainer,
  UserProfileContainer,
} from 'pages/authorized/user-profile/elements';

import { CurrentUserAvatar } from './CurrentUserAvatar';
import { UserAccessList } from './UserAccessList';

interface Props {
  companyInfo?: {
    name?: string;
    logo?: string;
  };
  updateUserDetails: (user: UserProfileUpdateQueryData) => void;
}

export const SAVE_CHANGES_BUTTON = 'Save changes';
export const INPUT_FIRST_NAME = 'First Name';
export const INPUT_LAST_NAME = 'Last Name';

export const UserProfileOverlayContent: React.FC<Props> = ({
  companyInfo,
  updateUserDetails,
}) => {
  const { t } = useTranslation('UserProfile');
  const history = useHistory();
  const { data: user } = useUserProfileQuery();
  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');
  const [logo, setLogo] = useState<string | undefined>();
  const { data: azureConfig } = useProjectConfigByKey('azureConfig');

  useEffect(() => {
    setFirstname(user?.firstname || '');
    setLastname(user?.lastname || '');
  }, [user?.firstname, user?.lastname]);

  useEffect(() => {
    const cancellablePromise = convertToCancellablePromise(
      import(`images/logo/${companyInfo?.logo}`)
    );
    cancellablePromise.promise
      .then((img) => {
        setLogo(img.default);
      })
      .catch(() => noop());
    return () => {
      cancellablePromise.cancel();
    };
  }, [companyInfo?.logo]);

  const logout = () => {
    history.push('/logout');
  };

  const onSaveChanges = () => {
    const updatedUser: UserProfileUpdateQueryData = {
      payload: {
        firstname:
          firstname !== user?.firstname ? firstname.trim() : user?.firstname,
        lastname:
          lastname !== user?.lastname ? lastname.trim() : user?.lastname,
      },
    };
    updateUserDetails(updatedUser);
  };

  const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSaveChanges();
    }
  };

  return (
    <UserProfileContainer>
      <AvatarAndEmailContainer>
        <CurrentUserAvatar size={72} />
        <EmailContainer>{user?.email}</EmailContainer>
      </AvatarAndEmailContainer>
      <InputFieldContainer>
        <Input
          disabled={azureConfig?.enabled}
          id="user-profile-firstname"
          title={t(INPUT_FIRST_NAME)}
          variant="noBorder"
          value={firstname || ''}
          onChange={(event: any) => setFirstname(event.target.value)}
          onKeyPress={onKeyPress}
        />
      </InputFieldContainer>
      <InputFieldContainer>
        <Input
          disabled={azureConfig?.enabled}
          id="user-profile-lastname"
          title={t(INPUT_LAST_NAME)}
          variant="noBorder"
          value={lastname || ''}
          onChange={(event: any) => setLastname(event.target.value)}
          onKeyPress={onKeyPress}
        />
      </InputFieldContainer>

      {!!companyInfo?.name && (
        <>
          <CompanyLabel>Company</CompanyLabel>
          <CompanyInfoContainer>
            {logo && <img src={logo} alt="Company Logo" />}
            <div className="cogs-body-2">{companyInfo?.name}</div>
          </CompanyInfoContainer>
        </>
      )}

      <SaveButtonContainer>
        <Button
          disabled={azureConfig?.enabled}
          type="primary"
          onClick={onSaveChanges}
          role="button"
          aria-label="Save"
        >
          {t(SAVE_CHANGES_BUTTON)}
        </Button>
      </SaveButtonContainer>

      <UserAccessList />

      <LogOutButtonContainer>
        <LogoutButton handleClick={logout} />
      </LogOutButtonContainer>
    </UserProfileContainer>
  );
};
