import { Avatar, Button } from '@cognite/cogs.js';
import styled from 'styled-components';
import { sizes } from 'styles/layout';

const StyledButton = styled(Button)`
  && {
    padding: ${sizes.small} ${sizes.small};
  }
`;

export const AvatarButton: React.FC = () => {
  return (
    <StyledButton>
      <Avatar text="QC" />
    </StyledButton>
  );
};
