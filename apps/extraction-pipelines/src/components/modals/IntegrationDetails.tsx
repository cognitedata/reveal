import React, { FunctionComponent, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Integration } from '../../model/Integration';
import Details from './Details';
import IntegrationModal from './IntegrationModal';
import { ids } from '../../cogs-variables';
import { HeadingWithUnderline } from '../../styles/StyledHeadings';
import FooterWithWarning from './FooterWithWarning';
import IntegrationModalHeading from './IntegrationModalHeading';
import { useDetailsGlobalChanges } from '../../hooks/details/useDetailsGlobalChanges';

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

export const CLOSE_CONFIRM_CONTENT: Readonly<string> =
  'Are you sure you want to close without saving?';
const IntegrationDetails: FunctionComponent<Props> = ({
  visible,
  onCancel,
  integration,
}: Props) => {
  const { changes, addChange, removeChange } = useDetailsGlobalChanges();
  const [showConfirmBox, setShowConfirmBox] = useState(false);
  useEffect(() => {
    setShowConfirmBox(changes.length > 0);
  }, [changes]);

  const onCancelClick = () => {
    onCancel();
  };

  return (
    <>
      <IntegrationModal
        title={
          <IntegrationModalHeading
            heading={integration.name}
            externalId={integration.externalId}
            onCancel={onCancelClick}
            popConfirmContent={CLOSE_CONFIRM_CONTENT}
            showConfirmBox={showConfirmBox}
          />
        }
        visible={visible}
        footer={
          <FooterWithWarning
            onPrimaryClick={onCancelClick}
            error={changes.length > 0 ? 'Unsaved information' : undefined}
            primaryText="Close"
            popConfirmContent={CLOSE_CONFIRM_CONTENT}
            showConfirmBox={showConfirmBox}
          />
        }
        width={872}
        appElement={document.getElementsByClassName(ids.styleScope).item(0)!}
      >
        <ContentTitle level={3} data-testid="view-integration-details-modal">
          Integration details
        </ContentTitle>
        <Details
          integration={integration}
          addChange={addChange}
          removeChange={removeChange}
        />
      </IntegrationModal>
    </>
  );
};

export default IntegrationDetails;
