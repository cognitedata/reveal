import { useUserInfoQuery } from 'domain/userManagementService/internal/queries/useUserInfoQuery';

import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import noop from 'lodash/noop';
import { convertToCancellablePromise } from 'utils/cancellablePromise';

import { Input } from '@cognite/cogs.js';
import { LogoutButton } from '@cognite/react-container';

import { useTranslation } from 'hooks/useTranslation';
import {
  AvatarAndEmailContainer,
  CompanyInfoContainer,
  CompanyLabel,
  EmailContainer,
  InputFieldContainer,
  LogOutButtonContainer,
  UserProfileContainer,
} from 'pages/authorized/user-profile/elements';

import { CurrentUserAvatar } from './CurrentUserAvatar';
import { UserAccessList } from './UserAccessList';

interface Props {
  companyInfo?: {
    name?: string;
    logo?: string;
  };
}

export const INPUT_NAME = 'Name';

export const UserProfileOverlayContent: React.FC<Props> = ({ companyInfo }) => {
  const { t } = useTranslation('UserProfile');
  const history = useHistory();
  const { data: user } = useUserInfoQuery();
  const [displayName, setDisplayName] = useState<string>('');
  const [logo, setLogo] = useState<string | undefined>();

  useEffect(() => {
    setDisplayName(user?.displayName || '');
  }, [user?.displayName]);

  useEffect(() => {
    // error from: plugin:rollup-plugin-dynamic-import-variables
    // Requires the use of extensions in dynamic imports
    if (!companyInfo || !companyInfo.logo) {
      return () => null;
    }
    const file = companyInfo.logo.split('.');
    const extension = file.pop();
    const cancellablePromise = convertToCancellablePromise(
      import(`../../../images/logo/${file.join('.')}.${extension}`)
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

  return (
    <UserProfileContainer>
      <AvatarAndEmailContainer>
        <CurrentUserAvatar size={72} />
        <EmailContainer>{user?.email}</EmailContainer>
      </AvatarAndEmailContainer>
      <InputFieldContainer>
        <Input
          disabled
          id="user-profile-firstname"
          title={t(INPUT_NAME)}
          variant="noBorder"
          value={displayName}
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

      <UserAccessList />

      <LogOutButtonContainer>
        <LogoutButton handleClick={logout} />
      </LogOutButtonContainer>
    </UserProfileContainer>
  );
};
