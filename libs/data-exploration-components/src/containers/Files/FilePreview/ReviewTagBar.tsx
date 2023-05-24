import { Body, Button, Icon, Link } from '@cognite/cogs.js';
import { ResourceIcons } from '@data-exploration-components/components/index';
import { ResourceType } from '@cognite/data-exploration';
import React from 'react';
import styled from 'styled-components';
import { createLink } from '@cognite/cdf-utilities';
import { capitalizeFirstLetter } from '@data-exploration-components/utils/index';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import {
  getExtendedAnnotationLabel,
  getResourceIdFromExtendedAnnotation,
  getResourceTypeFromExtendedAnnotation,
  isSuggestedAnnotation,
} from './migration/utils';

const ReviewTagBar = ({
  annotation,
  onApprove,
  onReject,
}: {
  annotation: ExtendedAnnotation;
  onApprove: (annotation: ExtendedAnnotation) => void;
  onReject: (annotation: ExtendedAnnotation) => void;
}) => (
  <ReviewTagWrapper>
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {getResourceTypeFromExtendedAnnotation(annotation) && (
        <ResourceIcons
          type={
            getResourceTypeFromExtendedAnnotation(annotation) as ResourceType
          }
          style={{
            background: 'white',
            color: 'black',
            marginTop: '-5px',
          }}
        />
      )}
      <Body level={2} strong>
        {getResourceTypeFromExtendedAnnotation(annotation)
          ? capitalizeFirstLetter(
              getResourceTypeFromExtendedAnnotation(annotation)
            )
          : 'Unlinked tag'}
      </Body>
    </div>
    <StyledTag>
      {getExtendedAnnotationLabel(annotation) || 'N/A'}{' '}
      {getResourceIdFromExtendedAnnotation(annotation) ? (
        <Link
          href={createLink(
            `/explore/${getResourceTypeFromExtendedAnnotation(
              annotation
            )}/${getResourceIdFromExtendedAnnotation(annotation)}`
          )}
          target="_blank"
        >
          <StyledIcon type="ArrowUpRight" />
        </Link>
      ) : undefined}
    </StyledTag>

    {isSuggestedAnnotation(annotation) && (
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

const StyledIcon = styled(Icon)`
  margin-bottom: -4px;
  margin-left: 4px;
`;
