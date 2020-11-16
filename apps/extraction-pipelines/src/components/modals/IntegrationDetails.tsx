import { Button, Icon, Title } from '@cognite/cogs.js';
import InteractiveCopy from 'components/InteractiveCopy';
import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Integration } from '../../model/Integration';
import Details from './Details';
import IntegrationModal from './IntegrationModal';
import { ids } from '../../cogs-variables';
import { HeadingWithUnderline } from '../../styles/StyledHeadings';

const ContentTitle = styled((props) => (
  <HeadingWithUnderline {...props}>{props.children}</HeadingWithUnderline>
))`
  margin-top: 3rem;
  margin-bottom: 2rem;
  font-size: 1.5rem;
`;

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
interface OwnProps {
  visible: boolean;
  onCancel: () => void;
  integration: Integration;
}

type Props = OwnProps;

const IntegrationDetails: FunctionComponent<Props> = ({
  visible,
  onCancel,
  integration,
}: Props) => {
  return (
    <>
      <IntegrationModal
        title={
          <IntegrationModalHeading
            heading={integration.name}
            id={integration.id}
            onCancel={onCancel}
          />
        }
        visible={visible}
        cancelText="Close"
        onCancel={onCancel}
        width={872}
        appElement={document.getElementsByClassName(ids.styleScope).item(0)!}
      >
        <ContentTitle level={3}>Integration details</ContentTitle>
        <Details integration={integration} />
      </IntegrationModal>
    </>
  );
};

interface IntegrationModalHeadingProps {
  heading: string;
  id: number;
  onCancel: () => void;
  // eslint-disable-next-line react/require-default-props
  closeIcon?: React.ReactNode;
}
const IntegrationModalHeading = ({
  heading,
  id,
  onCancel,
  closeIcon = <Icon type="Close" />,
}: IntegrationModalHeadingProps) => {
  return (
    <StyledHeader>
      <StyledH2>
        View integration details <span className="details-name">{heading}</span>
      </StyledH2>
      <span className="details-id">
        ID: {id} <InteractiveCopy text={`${id}`} />
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

export default IntegrationDetails;
