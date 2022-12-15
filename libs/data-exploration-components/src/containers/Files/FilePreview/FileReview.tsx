import { CogniteAnnotation } from '@cognite/annotations';
import { Body, Button, Icon } from '@cognite/cogs.js';
import { ProposedCogniteAnnotation } from '@cognite/react-picture-annotation';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { Tooltip } from 'antd';
import { ResourceIcons } from 'components';
import { AppContext } from 'context/AppContext';
import React, { useContext } from 'react';
import styled from 'styled-components';

const FileReview = ({
  annotations,
  onApprove,
  onTypeClick,
}: {
  annotations: Array<CogniteAnnotation | ProposedCogniteAnnotation>;
  onApprove: (
    _annotations: Array<CogniteAnnotation | ProposedCogniteAnnotation>
  ) => void;
  onTypeClick: (type: 'assets' | 'files') => void;
}) => {
  const context = useContext(AppContext);
  const { data: labelsReadAcl } = usePermissions(
    context?.flow!,
    'labelsAcl',
    'READ',
    undefined,
    { enabled: !!context?.flow }
  );
  const { data: labelsWriteAcl } = usePermissions(
    context?.flow!,
    'labelsAcl',
    'WRITE',
    undefined,
    { enabled: !!context?.flow }
  );

  const labelsAccess = labelsReadAcl && labelsWriteAcl;

  const linkedAnnotations = annotations.filter(
    an => !!an.resourceId || !!an.resourceExternalId
  );
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

        <Body level={2}>{linkedAnnotations.length}</Body>
      </div>
      {pendingAnnotations.length ? (
        <Tooltip
          title={
            !labelsAccess &&
            'Missing permissions to approve tags, labels:read & labels:write'
          }
        >
          <ButtonWrapper>
            <Button
              onClick={() => onApprove(annotations)}
              icon="Checkmark"
              style={{ width: '100%' }}
              type="tertiary"
              disabled={!labelsAccess}
            >
              Approve {pendingAnnotations.length} new tags
            </Button>
          </ButtonWrapper>
        </Tooltip>
      ) : null}

      <StyledTag onClick={() => onTypeClick('assets')}>
        <IconWrapper>
          <ResourceIcons
            style={{
              marginTop: '-5px',
              background: 'transparent',
            }}
            type="asset"
          />
          <Body style={{ color: '#4255BB' }} level={2} strong>
            Assets
          </Body>
          {pendingAssetAnnotations.length ? (
            <Body
              level={2}
              style={{ color: '#4255BB', opacity: '0.7', marginLeft: '5px' }}
            >
              {pendingAssetAnnotations.length} new
            </Body>
          ) : null}
        </IconWrapper>
        <CountWrapper>
          <Body level={5}>{assetAnnotations.length}</Body>
          <Icon type="ChevronRight" style={{ marginTop: '3px' }} />
        </CountWrapper>
      </StyledTag>
      <StyledTag onClick={() => onTypeClick('files')}>
        <IconWrapper>
          <ResourceIcons
            style={{
              marginTop: '-5px',
              background: 'transparent',
            }}
            type="file"
          />{' '}
          <Body style={{ color: '#4255BB' }} level={2} strong>
            Diagrams
          </Body>
          {pendingFileAnnotations.length ? (
            <Body
              level={2}
              style={{ color: '#4255BB', opacity: '0.7', marginLeft: '5px' }}
            >
              {pendingFileAnnotations.length} new{' '}
            </Body>
          ) : null}
        </IconWrapper>
        <CountWrapper>
          <Body level={5}>{fileAnnotations.length}</Body>
          <Icon type="ChevronRight" style={{ marginTop: '3px' }} />
        </CountWrapper>
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
  padding: 8px 8px 4px;
  width: 100%;
  background: var(--cogs-bg-hover);
  color: var(--cogs-text-info);
  margin: 6px 0px 6px;
  border-radius: 8px;
  box-sizing: border-box;
  border: 1px solid var(--cogs-midblue-5);
  cursor: pointer;
  :hover {
    background: var(--cogs-bg-selected);
  }
`;

const ButtonWrapper = styled.div`
  margin: 6px 0px 6px;
  width: 100%;
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const CountWrapper = styled.div`
  display: flex;
`;
