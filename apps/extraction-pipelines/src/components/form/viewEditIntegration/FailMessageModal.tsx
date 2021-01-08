import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Colors, Button, Icon } from '@cognite/cogs.js';
import { DetailFieldNames } from 'model/Integration';
import Modal from '../../modals/Modal';
import { ids } from '../../../cogs-variables';
import { Integration } from '../../../model/Integration';
import InteractiveCopy from '../../InteractiveCopy';
import { ModalContent } from '../../modals/ModalContent';
import RelativeTimeWithTooltip from '../../integrations/cols/RelativeTimeWithTooltip';
import { StyledHeader, StyledH2 } from '../../../styles/StyledModal';

const StyledContent = styled.div`
  border: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
  border-radius: 0.3125rem;
  box-shadow: 0 0 0.1875rem 0 ${Colors['greyscale-grey3'].hex()};
  height: 100%;
  font-size: 0.875rem;
  font-weight: bold;
  padding: 1.25rem;
  margin: 0.875rem 0;
`;

const StyledFooter = styled.div`
  margin: 0 0 0 auto;
`;

const StyledErrorText = styled.p`
  font-weight: normal;
  padding-top: 0.3125rem;
`;

interface OwnProps {
  visible: boolean;
  onCancel: () => void;
  integration: Integration;
}

type Props = OwnProps;

export const NO_ERROR_MESSAGE: Readonly<string> = 'No error message set';
const FailMessageModal: FunctionComponent<Props> = ({
  visible,
  onCancel,
  integration,
}: Props) => {
  return (
    <Modal
      visible={visible}
      width={872}
      appElement={document.getElementsByClassName(ids.styleScope).item(0)!}
    >
      <ModalContent
        title={
          <StyledHeader>
            <StyledH2>
              Fail message
              <span className="details-name" data-testid="details-name">
                {integration?.name}
              </span>
            </StyledH2>
            <span className="details-id">
              {DetailFieldNames.EXTERNAL_ID}: {integration?.externalId}{' '}
              <InteractiveCopy text={`${integration?.externalId}`} />
            </span>
            <Button type="primary" onClick={onCancel}>
              <Icon type="Close" />
            </Button>
          </StyledHeader>
        }
        footer={
          <StyledFooter>
            <Button type="primary" onClick={onCancel}>
              Close
            </Button>
          </StyledFooter>
        }
      >
        <StyledContent>
          <RelativeTimeWithTooltip
            id="latest-run"
            time={integration.lastFailure as number}
          />
          <StyledErrorText>
            {integration.lastMessage ?? <i>{NO_ERROR_MESSAGE}</i>}
          </StyledErrorText>
        </StyledContent>
      </ModalContent>
    </Modal>
  );
};

export default FailMessageModal;
