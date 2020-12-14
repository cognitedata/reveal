import React, { FunctionComponent } from 'react';
import DetailsHeading from 'components/modals/DetailsHeading';
import DetailsFooter from 'components/modals/DetailsFooter';
import { useQueryCache } from 'react-query';
import styled from 'styled-components';
import Modal, { ModalContent, ProviderWrapper } from './Modal';
import {
  CLOSE_CONFIRM_CONTENT,
  UNSAVED_INFO_TEXT,
} from '../modals/IntegrationDetails';
import { ids } from '../../cogs-variables';
import { Integration } from '../../model/Integration';
import { useAppEnv } from '../../hooks/useAppEnv';
import { HeadingWithUnderline } from '../../styles/StyledHeadings';
import MetaData from './MetaData';
import MainDetails from './MainDetails';
import ContactsDetails from './ContactsDetails';

const ContentTitle = styled((props) => (
  <HeadingWithUnderline {...props}>{props.children}</HeadingWithUnderline>
))`
  margin: 1.5rem 0;
  font-size: 1.5rem;
`;

interface OwnProps {
  visible: boolean;
  onCancel: () => void;
  integration: Integration;
}

type Props = OwnProps;

const DetailsModal: FunctionComponent<Props> = ({
  visible,
  onCancel,
  integration,
}: Props) => {
  const queryCache = useQueryCache();
  const { project } = useAppEnv();

  const onCancelClick = () => {
    queryCache.invalidateQueries(['integrations', project]);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      width={872}
      appElement={document.getElementsByClassName(ids.styleScope).item(0)!}
    >
      <ProviderWrapper integration={integration}>
        <ModalContent
          title={
            <DetailsHeading
              onCancel={onCancelClick}
              popConfirmContent={CLOSE_CONFIRM_CONTENT}
            />
          }
          footer={
            <DetailsFooter
              onPrimaryClick={onCancelClick}
              primaryText="Close"
              errorText={UNSAVED_INFO_TEXT}
              popConfirmContent={CLOSE_CONFIRM_CONTENT}
            />
          }
        >
          <ContentTitle level={3} data-testid="view-integration-details-modal">
            Integration details
          </ContentTitle>
          <MainDetails />
          <MetaData />
          <ContactsDetails />
        </ModalContent>
      </ProviderWrapper>
    </Modal>
  );
};

export default DetailsModal;
