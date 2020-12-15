import React from 'react';
import { Colors, Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import ClosePopconfirm from 'components/buttons/ClosePopconfirm';
import { DetailFieldNames } from 'model/Integration';
import InteractiveCopy from '../InteractiveCopy';
import { IntegrationAction } from '../menu/IntegrationsTableActions';
import { useIntegration } from '../../hooks/details/IntegrationContext';

const StyledHeader = styled.header`
  display: flex;
  justify-content: space-between;
  .details-id {
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    margin-left: 1rem;

    span {
      margin-left: 0.3rem;
    }
  }
  button {
    background: ${Colors.white.hex()};
    color: ${Colors.black.hex()};
    border: none;
    &:hover {
      outline: none;
      box-shadow: none;
    }
  }
`;
const StyledH2 = styled((props) => (
  <Title level={2} {...props}>
    {props.children}
  </Title>
))`
  font-size: 1.125rem;
  .details-name {
    margin-left: 1rem;
    font-size: 0.875rem;
  }
`;

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
