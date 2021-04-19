import React from 'react';
import { Icon } from '@cognite/cogs.js';
import { DetailFieldNames } from 'model/Integration';
import InteractiveCopy from 'components/InteractiveCopy';
import { useIntegration } from 'hooks/details/IntegrationContext';
import { StyledHeader, StyledH2 } from 'styles/StyledModal';
import { ToggleableConfirmDialog } from 'components/buttons/ToggleableConfirmDialog';

export enum IntegrationAction {
  VIEW_EDIT_DETAILS = 'View/edit integration',
}
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
        <InteractiveCopy
          text={`${integration?.externalId}`}
          copyType="externalId"
        />
      </span>
      <ToggleableConfirmDialog
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
