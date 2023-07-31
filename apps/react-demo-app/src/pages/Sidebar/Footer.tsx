import { Version } from '@cognite/react-version';

import { FooterContainer } from './elements';

export const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <Version />
    </FooterContainer>
  );
};
