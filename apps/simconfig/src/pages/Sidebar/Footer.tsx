import { Graphic } from '@cognite/cogs.js';

import { FooterContainer, VersionWrapper } from './elements';

export const Footer: React.FC = () => {
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
          Version {process.env.REACT_APP_VERSION}
        </div>
      </VersionWrapper>
    </FooterContainer>
  );
};
