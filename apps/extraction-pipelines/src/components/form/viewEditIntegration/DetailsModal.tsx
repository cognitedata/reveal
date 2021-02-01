import React, { FunctionComponent } from 'react';
import DetailsHeading from 'components/modals/DetailsHeading';
import DetailsFooter from 'components/modals/DetailsFooter';
import { useQueryClient } from 'react-query';
import styled from 'styled-components';
import Modal from '../../modals/Modal';
import { ids } from '../../../cogs-variables';
import { Integration } from '../../../model/Integration';
import { useAppEnv } from '../../../hooks/useAppEnv';
import { HeadingWithUnderline } from '../../../styles/StyledHeadings';
import { MetaDataGrid } from './MetaDataGrid';
import MainDetails from './MainDetails';
import ContactsDetails from './ContactsDetails';
import { IntegrationProvider } from '../../../hooks/details/IntegrationContext';
import { ModalContent } from '../../modals/ModalContent';

const ContentTitle = styled((props) => (
  <HeadingWithUnderline {...props}>{props.children}</HeadingWithUnderline>
))`
  margin: 1.5rem 0;
  font-size: 1.5rem;
`;
export const CLOSE_CONFIRM_CONTENT: Readonly<string> =
  'Are you sure you want to close without saving?';
export const UNSAVED_INFO_TEXT = 'Unsaved information';

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
  const client = useQueryClient();
  const { project } = useAppEnv();

  const onCancelClick = () => {
    client.invalidateQueries(['integrations', project]);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      width={872}
      appElement={document.getElementsByClassName(ids.styleScope).item(0)!}
    >
      <IntegrationProvider initIntegration={integration}>
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
          <MetaDataGrid />
          <ContactsDetails />
        </ModalContent>
      </IntegrationProvider>
    </Modal>
  );
};

export default DetailsModal;
