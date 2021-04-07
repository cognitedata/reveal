import React from 'react';

import styled from 'styled-components';
import { Button, Title, Body, Icon } from '@cognite/cogs.js';
import { AnnotationsBadgeProps } from 'src/pages/Workflow/types';
import { Divider } from '@cognite/data-exploration';
import { JobStatus } from 'src/api/types';

export function AnnotationsBadgePopoverContent({
  gdpr,
  tag,
  textAndObjects,
}: AnnotationsBadgeProps) {
  const row = (data: any) => {
    const setBadge = (count: number, status: JobStatus) => {
      if (status === 'Running') {
        return <Icon type="Loading" />;
      }
      if (status === 'Failed') {
        return <Icon type="ErrorStroked" />;
      }

      if (count !== undefined && status !== 'Queued') {
        return String(count);
      }
      return '[–]';
    };
    return (
      <GridLayout>
        <GridIcon>
          <Button
            icon={data.icon}
            size="small"
            style={{
              marginRight: '5px',
              backgroundColor: data.backgroundColor,
              color: data.color,
              borderRadius: '15px',
            }}
          />
        </GridIcon>
        <GridName>
          <Title level={5}> {data.title} </Title>
        </GridName>
        <GridModelGenerated>
          <Body level={1}> Model Generated </Body>
        </GridModelGenerated>
        <GridModelGeneratedCount style={{ color: data.color }}>
          {setBadge(data.modelGenerated, data.status)}
        </GridModelGeneratedCount>

        <GridManuallyGenerated>
          <Body level={1}> Manually Generated </Body>
        </GridManuallyGenerated>
        <GridManuallyGeneratedCount style={{ color: data.color }}>
          [{data.manuallyGenerated !== undefined ? data.manuallyGenerated : '–'}
          ]
        </GridManuallyGeneratedCount>
      </GridLayout>
    );
  };
  return (
    <>
      <Body level={1}> Detections </Body>
      <Divider.Horizontal />

      {gdpr?.status &&
        row({
          status: gdpr.status,
          title: 'GDPR',
          icon: 'WarningFilled',
          backgroundColor: '#FBE9ED',
          color: '#B30539',
          modelGenerated: gdpr.modelGenerated,
          manuallyGenerated: gdpr.manuallyGenerated,
        })}
      {tag?.status &&
        row({
          status: tag.status,
          title: 'Assets',
          icon: 'Link',
          backgroundColor: '#F4DAF8',
          color: '#C945DB',
          modelGenerated: tag.modelGenerated,
          manuallyGenerated: tag.manuallyGenerated,
        })}

      {textAndObjects?.status &&
        row({
          status: textAndObjects.status,
          title: 'Text and Objects',
          icon: 'Scan',
          backgroundColor: '#FFE1D1',
          color: '#FF8746',
          modelGenerated: textAndObjects.modelGenerated,
          manuallyGenerated: textAndObjects.manuallyGenerated,
        })}
    </>
  );
}

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr;
  grid-template-rows: auto;
  grid-template-areas:
    'icon name name . .'
    '. modelGenerated modelGenerated . modelGeneratedCount'
    '. manuallyGenerated manuallyGenerated . manuallyGeneratedCount';
  padding-bottom: 23px;
`;

const GridIcon = styled.div`
  grid-area: icon;
`;

const GridName = styled.div`
  grid-area: name;
`;

const GridModelGenerated = styled.div`
  grid-area: modelGenerated;
`;
const GridModelGeneratedCount = styled.div`
  grid-area: modelGeneratedCount;
`;

const GridManuallyGenerated = styled.div`
  grid-area: manuallyGenerated;
`;
const GridManuallyGeneratedCount = styled.div`
  grid-area: manuallyGeneratedCount;
`;
