import React from 'react';
import { Icon } from '@cognite/cogs.js';
import ClosePopconfirm from 'components/buttons/ClosePopconfirm';
import { DetailFieldNames } from 'model/Integration';
import InteractiveCopy from '../InteractiveCopy';
import { IntegrationAction } from '../menu/IntegrationsTableActions';
import { useIntegration } from '../../hooks/details/IntegrationContext';
import { StyledHeader, StyledH2 } from '../../styles/StyledModal';

interface IntegrationModalHeadingProps {
  onCancel: () => void;
  // eslint-disable-next-line react/require-default-props
  popConfirmContent?: string;
  // eslint-disable-next-line react/require-default-props
  closeIcon?: React.ReactNode;
}
const DetailsHeading = ({
  onCancel,
  popConfirmContent,
  closeIcon = <Icon type="Close" />,
}: IntegrationModalHeadingProps) => {
  const {
    state: { integration, updates },
  } = useIntegration();

  return (
    <StyledHeader>
      <StyledH2>
        {IntegrationAction.VIEW_EDIT_DETAILS}
        <span className="details-name">{integration?.name}</span>
      </StyledH2>
      <span className="details-id">
        {DetailFieldNames.EXTERNAL_ID}: {integration?.externalId}{' '}
        <InteractiveCopy text={`${integration?.externalId}`} />
      </span>
      <ClosePopconfirm
        showConfirmBox={updates.size > 0}
        onClick={onCancel}
        primaryText={closeIcon}
        popConfirmContent={popConfirmContent}
        testId="header-modal-close-btn"
      />
    </StyledHeader>
  );
};
export default DetailsHeading;
