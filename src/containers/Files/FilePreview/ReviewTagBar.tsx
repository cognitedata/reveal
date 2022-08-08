import { CogniteAnnotation } from '@cognite/annotations';
import { A, Body, Button, Icon } from '@cognite/cogs.js';
import { ProposedCogniteAnnotation } from '@cognite/react-picture-annotation';
import { ResourceIcons } from 'components';
import { ResourceType } from 'index';
import React from 'react';
import styled from 'styled-components';
import { capitalizeFirstLetter, createLink } from 'utils';

const ReviewTagBar = ({
  annotation,
  onApprove,
  onReject,
}: {
  annotation: CogniteAnnotation | ProposedCogniteAnnotation;
  onApprove: (
    annotation: CogniteAnnotation | ProposedCogniteAnnotation
  ) => void;
  onReject: (annotation: CogniteAnnotation | ProposedCogniteAnnotation) => void;
}) => (
  <ReviewTagWrapper>
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {annotation?.resourceType && (
        <ResourceIcons
          type={annotation?.resourceType as ResourceType}
          style={{
            background: 'white',
            color: 'black',
            marginTop: '-5px',
          }}
        />
      )}
      <Body level={2} strong>
        {annotation?.resourceType
          ? capitalizeFirstLetter(annotation?.resourceType)
          : 'Unlinked tag'}
      </Body>
    </div>
    <StyledTag>
      {annotation?.label || 'N/A'}{' '}
      {annotation.resourceId ? (
        <A
          href={createLink(
            `/explore/${annotation.resourceType}/${annotation.resourceId}`
          )}
          target="_blank"
          rel="noopener"
        >
          <Icon
            type="ArrowUpRight"
            style={{ marginBottom: '-4px', marginLeft: '4px' }}
          />
        </A>
      ) : undefined}
    </StyledTag>

    {annotation.status === 'unhandled' && (
      <>
        <ButtonWrapper>
          <Button
            onClick={() => onApprove(annotation)}
            type="primary"
            icon="Checkmark"
            style={{ width: '100%' }}
          >
            Approve tag
          </Button>
        </ButtonWrapper>
        <ButtonWrapper>
          <Button
            onClick={() => onReject(annotation)}
            type="secondary"
            icon="Close"
            style={{ width: '100%' }}
          >
            Reject tag
          </Button>
        </ButtonWrapper>
      </>
    )}
  </ReviewTagWrapper>
);

export default ReviewTagBar;

const ReviewTagWrapper = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--cogs-border-default);
  padding: 12px;
  margin: 6px 0px 6px;
  border-radius: 8px;
`;

const StyledTag = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 6px 8px 8px;
  width: 100%;
  background: var(--cogs-bg-hover);
  color: var(--cogs-text-info);
  margin: 6px 0px 6px;
  border: 1px solid var(--cogs-link-inverted-default);
  border-radius: 8px;
  box-sizing: border-box;
`;

const ButtonWrapper = styled.div`
  margin: 6px 0px 6px;
  width: 100%;
`;
