import { Graphic } from '@cognite/cogs.js';

import { FooterContainer, VersionWrapper } from './elements';

export function Footer() {
  return (
    <FooterContainer>
      <Graphic
        style={{
          width: 32,
          height: 19,
        }}
        type="Cognite"
      />
      <VersionWrapper>
        <div aria-label="Version" className="cogs-micro">
          Version {process.env.REACT_APP_VERSION}
        </div>
      </VersionWrapper>
    </FooterContainer>
  );
}
