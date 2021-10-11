import { useTranslation } from 'react-i18next';

import { Graphic } from '@cognite/cogs.js';

import {
  UserProfileFooterContainer,
  VersionWrapper,
} from 'pages/authorized/user-profile/elements';

export const UserProfileOverlayFooter: React.FC = () => {
  const { t } = useTranslation('general');

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
          {t('Version')} {process.env.REACT_APP_VERSION}
        </div>
      </VersionWrapper>
    </UserProfileFooterContainer>
  );
};
