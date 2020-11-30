import React, { FunctionComponent } from 'react';
import { Button, Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
  padding: 0.625rem 1.25rem;
  border: 0.0625rem solid ${Colors['greyscale-grey2'].hex()};
  border-radius: 0.125rem;
  box-shadow: 0 0.125rem 0.5rem ${Colors['greyscale-grey2'].hex()};
`;
const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex: 1;
  button {
    align-self: end;
  }
`;
const ForStyling = styled.div``;
const StyledIcon = styled((props) => <Icon {...props} />)`
  margin-right: 1rem;
  width: 1.2rem;
  svg {
    g {
      g:first-child {
        path {
          fill: ${(props) => props.$color};
        }
      }
      #Vector {
        path {
          fill: ${Colors.black.hex()};
        }
      }
    }
  }
`;
interface OwnProps {
  // eslint-disable-next-line react/require-default-props
  error?: string;
  // eslint-disable-next-line react/require-default-props
  onPrimaryClick?: (update: boolean) => void;
  primaryText: string;
}

type Props = OwnProps;

const FooterWithWarning: FunctionComponent<Props> = ({
  primaryText,
  onPrimaryClick,
  error,
}: Props) => {
  const onClick = () => {
    if (onPrimaryClick) {
      onPrimaryClick(true);
    }
  };
  return (
    <Wrapper>
      <ForStyling />
      {error && (
        <ErrorMessage>
          <StyledIcon
            type="Warning"
            $color={Colors.warning.hex()}
            data-testid="unsaved-warning-icon-all"
          />
          {error}
        </ErrorMessage>
      )}
      <Button type="primary" onClick={onClick}>
        {primaryText}
      </Button>
    </Wrapper>
  );
};

export default FooterWithWarning;
