import React from 'react';
import { Colors, Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import ClosePopconfirm from 'components/buttons/ClosePopconfirm';
import InteractiveCopy from '../InteractiveCopy';
import { IntegrationAction } from '../menu/IntegrationsTableActions';
import { DetailFieldNames } from '../../utils/integrationUtils';

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
  heading: string;
  externalId: string;
  onCancel: () => void;
  showConfirmBox: boolean;
  // eslint-disable-next-line react/require-default-props
  popConfirmContent?: string;
  // eslint-disable-next-line react/require-default-props
  closeIcon?: React.ReactNode;
}
const IntegrationModalHeading = ({
  heading,
  externalId,
  showConfirmBox,
  onCancel,
  popConfirmContent,
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
      <ClosePopconfirm
        showConfirmBox={showConfirmBox}
        onClick={onCancel}
        primaryText={closeIcon}
        popConfirmContent={popConfirmContent}
        testId="header-modal-close-btn"
      />
    </StyledHeader>
  );
};
export default IntegrationModalHeading;
