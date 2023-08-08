import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

type Props = {
  className: string;
  onDelete?: () => void;
};

const DeleteButton = ({ className, onDelete }: Props) => {
  return (
    <StyledButton
      aria-label="Delete edge"
      icon="Delete"
      className={className}
      onClick={onDelete}
      type="primary"
      size="small"
    />
  );
};

const StyledButton = styled(Button)`
  cursor: pointer;
  color: white;
`;

export default DeleteButton;
