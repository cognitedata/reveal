import { useHistory } from 'react-router-dom';

import styled from 'styled-components/macro';

import { Button } from '@cognite/cogs.js';

export interface Props {
  href?: string;
  onClick?: () => void;
  underlined?: boolean;
}

const StyledButton = styled(Button)`
  display: inline;
  font-weight: inherit;
  color: var(--cogs-primary);
  text-decoration: ${(props: Props) =>
    props.underlined ? 'underline' : 'inherit'};
  cursor: pointer;
  padding: 0px !important;
  height: auto;

  &:hover {
    display: inline;
    color: var(--cogs-midblue-2);
    background-color: transparent;
    text-decoration: underline;
  }

  &:active {
    display: inline;
    color: var(--cogs-midblue-1);
    text-decoration: underline;
  }
`;

export const Link: React.FC<Props> = ({
  children,
  href,
  onClick,
  underlined,
  ...rest
}) => {
  const history = useHistory();

  return (
    <StyledButton
      size="default"
      variant="default"
      type="link"
      underlined={underlined}
      data-testid="link-btn"
      onClick={onClick || (() => href && history.push(href))}
      {...rest}
    >
      {children}
    </StyledButton>
  );
};

export default Link;
