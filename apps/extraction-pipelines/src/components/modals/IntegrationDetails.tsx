import React, { FunctionComponent, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useQueryCache } from 'react-query';
import { Integration } from '../../model/Integration';
import Details from './Details';
import IntegrationModal from './IntegrationModal';
import { ids } from '../../cogs-variables';
import { HeadingWithUnderline } from '../../styles/StyledHeadings';
import FooterWithWarning from './FooterWithWarning';
import IntegrationModalHeading from './IntegrationModalHeading';
import { useDetailsGlobalChanges } from '../../hooks/details/useDetailsGlobalChanges';
import { useAppEnv } from '../../hooks/useAppEnv';
import { useIntegrationById } from '../../hooks/useIntegration';

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
export const UNSAVED_INFO_TEXT = 'Unsaved information';
const IntegrationDetails: FunctionComponent<Props> = ({
  visible,
  onCancel,
  integration,
}: Props) => {
  const queryCache = useQueryCache();
  const { project } = useAppEnv();

  const { data: singleIntegration } = useIntegrationById(integration.id);
  const [display, setDisplay] = useState(integration);
  useEffect(() => {
    if (singleIntegration) {
      setDisplay((old) => {
        return { ...old, ...singleIntegration };
      });
    }
  }, [singleIntegration]);

  const { changes, addChange, removeChange } = useDetailsGlobalChanges();
  const [showConfirmBox, setShowConfirmBox] = useState(false);
  useEffect(() => {
    setShowConfirmBox(changes.length > 0);
  }, [changes]);

  const onCancelClick = () => {
    queryCache.invalidateQueries(['integrations', project]);
    onCancel();
  };

  return (
    <>
      <IntegrationModal
        title={
          <IntegrationModalHeading
            heading={display.name}
            externalId={display.externalId}
            onCancel={onCancelClick}
            popConfirmContent={CLOSE_CONFIRM_CONTENT}
            showConfirmBox={showConfirmBox}
          />
        }
        visible={visible}
        footer={
          <FooterWithWarning
            onPrimaryClick={onCancelClick}
            error={changes.length > 0 ? UNSAVED_INFO_TEXT : undefined}
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
          integration={display}
          addChange={addChange}
          removeChange={removeChange}
        />
      </IntegrationModal>
    </>
  );
};

export default IntegrationDetails;
