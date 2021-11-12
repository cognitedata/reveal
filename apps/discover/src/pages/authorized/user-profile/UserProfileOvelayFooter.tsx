import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Graphic } from '@cognite/cogs.js';

import { fetchGet } from '_helpers/fetch';
import {
  UserProfileFooterContainer,
  VersionWrapper,
} from 'pages/authorized/user-profile/elements';

export const UserProfileOverlayFooter: React.FC = () => {
  const { t } = useTranslation('general');
  const [version, setVersion] = React.useState('');

  const handleRawResponse = (response: Response) => {
    setVersion(response.headers.get('x-cognite-fas-version') || '');
  };

  React.useEffect(() => {
    // try and get version headers:
    fetchGet(window.location.origin, {
      mode: 'no-cors',
      headers: {},
      handleRawResponse,
    });
  }, []);

  return (
    <UserProfileFooterContainer>
      <Graphic
        type="Cognite"
        style={{
          width: 32,
          height: 19,
        }}
      />
      <VersionWrapper>
        <div className="cogs-micro" aria-label="Version">
          {t('Version')} {version}
        </div>
      </VersionWrapper>
    </UserProfileFooterContainer>
  );
};
