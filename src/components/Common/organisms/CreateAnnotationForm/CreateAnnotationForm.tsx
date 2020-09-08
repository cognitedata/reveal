import React from 'react';
import { Input, Button, Title, Icon, Colors } from '@cognite/cogs.js';
import { ProposedCogniteAnnotation } from '@cognite/react-picture-annotation';
import styled from 'styled-components';
import { ButtonRow } from 'components/Common';
import { CogniteAnnotation } from '@cognite/annotations';
import { itemSelector as assetSelector } from 'modules/assets';
import { itemSelector as timeseriesSelector } from 'modules/timeseries';
import { itemSelector as fileSelector } from 'modules/files';
import { itemSelector as sequenceSelector } from 'modules/sequences';
import { useSelector } from 'react-redux';

export const CreateAnnotationForm = ({
  annotation,
  updateAnnotation,
  onDelete,
  onSave,
  onCancel,
  onLinkResource,
  previewImageSrc,
  children,
}: {
  annotation: ProposedCogniteAnnotation | CogniteAnnotation;
  updateAnnotation: (
    annotation: ProposedCogniteAnnotation | CogniteAnnotation
  ) => void;
  onDelete: () => void;
  onCancel?: () => void;
  onSave: () => void;
  onLinkResource: () => void;
  previewImageSrc?: string;
  children?: React.ReactNode;
}) => {
  const getFile = useSelector(fileSelector);
  const getAsset = useSelector(assetSelector);
  const getTimeseries = useSelector(timeseriesSelector);
  const getSequence = useSelector(sequenceSelector);
  let buttonText = <>Not linked to a Resource</>;
  if (annotation.resourceType) {
    switch (annotation.resourceType) {
      case 'asset': {
        const resource = getAsset(
          annotation.resourceExternalId || annotation.resourceId
        );
        buttonText = (
          <>
            Linked to <Icon type="DataStudio" style={{ marginLeft: 4 }} />{' '}
            {resource ? resource.name : 'Asset'}
          </>
        );
        break;
      }
      case 'timeSeries': {
        const resource = getTimeseries(
          annotation.resourceExternalId || annotation.resourceId
        );
        buttonText = (
          <>
            Linked to <Icon type="Timeseries" style={{ marginLeft: 4 }} />{' '}
            {resource ? resource.name : 'Time Series'}
          </>
        );
        break;
      }
      case 'sequence': {
        const resource = getSequence(
          annotation.resourceExternalId || annotation.resourceId
        );
        buttonText = (
          <>
            Linked to <Icon type="GridFilled" style={{ marginLeft: 4 }} />{' '}
            {resource ? resource.name : 'Sequence'}
          </>
        );
        break;
      }
      case 'file': {
        const resource = getFile(
          annotation.resourceExternalId || annotation.resourceId
        );
        buttonText = (
          <>
            Linked to <Icon type="Document" style={{ marginLeft: 4 }} />{' '}
            {resource ? resource.name : 'File'}
          </>
        );
        break;
      }
    }
  }
  return (
    <Wrapper>
      <Title level={5}>
        {onCancel ? 'Edit annotation' : 'Create annotation'}
      </Title>
      {previewImageSrc && <PreviewImage src={previewImageSrc} alt="preview" />}
      <p>{buttonText}</p>
      <Button onClick={onLinkResource}>
        {annotation.resourceType ? (
          <>
            <Icon type="Edit" /> Edit Resource Link
          </>
        ) : (
          <>
            <Icon type="Plus" /> Link to Resource
          </>
        )}
      </Button>
      <Input
        variant="noBorder"
        placeholder="Label"
        value={annotation.label}
        onChange={e =>
          updateAnnotation({ ...annotation, label: e.target.value })
        }
      />
      <Input
        variant="noBorder"
        placeholder="Description"
        value={annotation.description}
        onChange={e =>
          updateAnnotation({
            ...annotation,
            description: e.target.value,
          })
        }
      />
      <ButtonRow>
        <Button
          onClick={onSave}
          type="primary"
          icon={onCancel ? 'Check' : 'Plus'}
        >
          {onCancel ? 'Save' : 'Create'}
        </Button>
        <div style={{ flex: 1 }} />
        {onCancel && <Button onClick={onCancel}>Cancel</Button>}
        <Button onClick={onDelete} icon="Delete" type="danger" />
      </ButtonRow>
      {children}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
  width: 100%;

  && > * {
    margin-bottom: 8px;
  }
`;

const PreviewImage = styled.img`
  max-height: 200px;
  padding: 12px;
  background: ${Colors['greyscale-grey3'].hex()};
  width: auto;
  object-fit: contain;
`;
