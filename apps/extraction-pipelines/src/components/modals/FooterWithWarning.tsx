import React, { FunctionComponent } from 'react';
import { Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import ClosePopconfirm from '../buttons/ClosePopconfirm';

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
  primaryText: string;
  showConfirmBox: boolean;
  // eslint-disable-next-line react/require-default-props
  popConfirmContent?: string;
  // eslint-disable-next-line react/require-default-props
  cancelText?: string;
  // eslint-disable-next-line react/require-default-props
  okText?: string;
  // eslint-disable-next-line react/require-default-props
  error?: string;
  // eslint-disable-next-line react/require-default-props
  onPrimaryClick?: (update: boolean) => void;
}

type Props = OwnProps;

const FooterWithWarning: FunctionComponent<Props> = ({
  primaryText,
  popConfirmContent = 'Are you sure?',
  cancelText = 'Cancel',
  okText = 'Confirm',
  onPrimaryClick,
  showConfirmBox,
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
      <ClosePopconfirm
        showConfirmBox={showConfirmBox}
        primaryText={primaryText}
        cancelText={cancelText}
        okText={okText}
        onClick={onClick}
        popConfirmContent={popConfirmContent}
        testId="footer-modal-close-btn"
      />
    </Wrapper>
  );
};

export default FooterWithWarning;
