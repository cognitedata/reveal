import { CogniteAnnotation } from '@cognite/annotations';
import { Body, Button } from '@cognite/cogs.js';
import { ProposedCogniteAnnotation } from '@cognite/react-picture-annotation';
import { ResourceIcons } from 'components';
import React from 'react';
import styled from 'styled-components';

const FileReview = ({
  annotations,
  onApprove,
}: {
  annotations: Array<CogniteAnnotation | ProposedCogniteAnnotation>;
  onApprove: (
    annotations: Array<CogniteAnnotation | ProposedCogniteAnnotation>
  ) => void;
}) => {
  const pendingAnnotations = annotations.filter(a => a.status === 'unhandled');

  const assetAnnotations = annotations.filter(a => a.resourceType === 'asset');

  const fileAnnotations = annotations.filter(a => a.resourceType === 'file');
  const pendingAssetAnnotations = pendingAnnotations.filter(
    a => a.resourceType === 'asset'
  );
  const pendingFileAnnotations = pendingAnnotations.filter(
    a => a.resourceType === 'file'
  );

  return (
    <ReviewTagWrapper>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Body level={2} strong>
          All tags
        </Body>

        <Body level={2}>{annotations.length}</Body>
      </div>
      {pendingAnnotations.length ? (
        <ButtonWrapper>
          <Button
            onClick={() => onApprove(annotations)}
            icon="Checkmark"
            style={{ width: '100%' }}
            type="tertiary"
          >
            Approve {pendingAnnotations.length} new tags
          </Button>
        </ButtonWrapper>
      ) : null}

      <StyledTag>
        <IconWrapper>
          <ResourceIcons
            style={{
              marginTop: '-5px',
              background: 'transparent',
            }}
            type="asset"
          />
          {pendingAssetAnnotations.length ? (
            <strong> {pendingAssetAnnotations.length} new</strong>
          ) : null}
        </IconWrapper>
        <Body level={5}>{assetAnnotations.length}</Body>
      </StyledTag>
      <StyledTag>
        <IconWrapper>
          <ResourceIcons
            style={{
              marginTop: '-5px',
              background: 'transparent',
            }}
            type="file"
          />{' '}
          {pendingFileAnnotations.length ? (
            <strong> {pendingFileAnnotations.length} new</strong>
          ) : null}
        </IconWrapper>
        <Body level={5}>{fileAnnotations.length}</Body>
      </StyledTag>
    </ReviewTagWrapper>
  );
};

export default FileReview;

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
  justify-content: space-between;
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

const IconWrapper = styled.div`
  display: flex;
`;
