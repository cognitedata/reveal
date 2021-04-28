import React, { FunctionComponent, PropsWithoutRef } from 'react';
import { Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { ToggleableConfirmDialog } from 'components/buttons/ToggleableConfirmDialog';
import { useIntegration } from 'hooks/details/IntegrationContext';

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
  errorText?: string;
  popConfirmContent?: string;
  cancelText?: string;
  okText?: string;
  onPrimaryClick?: (update: boolean) => void;
}

const DetailsFooter: FunctionComponent<OwnProps> = ({
  primaryText,
  errorText,
  popConfirmContent = 'Are you sure?',
  cancelText = 'Cancel',
  okText = 'Confirm',
  onPrimaryClick,
}: PropsWithoutRef<OwnProps>) => {
  const {
    state: { updates },
  } = useIntegration();

  const onClick = () => {
    if (onPrimaryClick) {
      onPrimaryClick(true);
    }
  };

  return (
    <Wrapper>
      <ForStyling />
      {updates.size > 0 && (
        <ErrorMessage>
          <StyledIcon
            type="Warning"
            $color={Colors.warning.hex()}
            data-testid="unsaved-warning-icon-all"
          />
          {errorText}
        </ErrorMessage>
      )}
      <ToggleableConfirmDialog
        showConfirmBox={updates.size > 0}
        primaryText={primaryText}
        cancelText={cancelText}
        okText={okText}
        onClick={onClick}
        popConfirmContent={popConfirmContent}
        testId="footer-modal-close-btn"
        type="primary"
      />
    </Wrapper>
  );
};

export default DetailsFooter;
