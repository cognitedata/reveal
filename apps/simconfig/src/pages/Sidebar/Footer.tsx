import { Graphic } from '@cognite/cogs.js';
import { useTranslation } from 'react-i18next';

import { FooterContainer, VersionWrapper } from './elements';

export const Footer: React.FC = () => {
  const { t } = useTranslation('general');

  return (
    <FooterContainer>
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
    </FooterContainer>
  );
};
