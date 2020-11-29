import React from 'react';
import { Button, Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import InteractiveCopy from '../InteractiveCopy';
import { IntegrationAction } from '../menu/IntegrationsTableActions';
import { DetailFieldNames } from '../../utils/integrationUtils';

const StyledHeader = styled.header`
  display: flex;
  .details-id {
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    margin-left: 1rem;

    span {
      margin-left: 0.3rem;
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
  heading: string;
  externalId: string;
  onCancel: () => void;
  // eslint-disable-next-line react/require-default-props
  closeIcon?: React.ReactNode;
}
const IntegrationModalHeading = ({
  heading,
  externalId,
  onCancel,
  closeIcon = <Icon type="Close" />,
}: IntegrationModalHeadingProps) => {
  return (
    <StyledHeader>
      <StyledH2>
        {IntegrationAction.VIEW_EDIT_DETAILS}
        <span className="details-name">{heading}</span>
      </StyledH2>
      <span className="details-id">
        {DetailFieldNames.EXTERNAL_ID}: {externalId}{' '}
        <InteractiveCopy text={`${externalId}`} />
      </span>
      {closeIcon && (
        <Button
          key="modal-close"
          unstyled
          className="cogs-modal-close"
          onClick={onCancel}
          aria-label="Close dialog"
        >
          {closeIcon}
        </Button>
      )}
    </StyledHeader>
  );
};
export default IntegrationModalHeading;
