import React from 'react';

import styled from 'styled-components';
import { Button, Title, Body, Icon } from '@cognite/cogs.js';
import { AnnotationsBadgeProps } from 'src/modules/Workflow/types';
import { Divider } from '@cognite/data-exploration';
import { JobStatus } from 'src/api/types';
import { showBadge, showGDPRBadge } from './AnnotationsBadge';

export function AnnotationsBadgePopoverContent({
  gdpr,
  tag,
  text,
  objects,
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
            aria-label={`${data.title} icon`}
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
          {data.manuallyGenerated !== undefined
            ? data.manuallyGenerated
            : '[–]'}
        </GridManuallyGeneratedCount>
      </GridLayout>
    );
  };
  return (
    <>
      <Body level={1}> Detections </Body>
      <Divider.Horizontal />
      {tag &&
        showBadge(tag) &&
        row({
          status: tag.status,
          title: 'Asset',
          icon: 'ResourceAssets',
          backgroundColor: '#F4DAF8',
          color: '#C945DB',
          modelGenerated: tag.modelGenerated,
          manuallyGenerated: tag.manuallyGenerated,
        })}
      {text &&
        showBadge(text) &&
        row({
          status: text.status,
          title: 'Text',
          icon: 'TextScan',
          backgroundColor: '#F0FCF8',
          color: '#404040',
          modelGenerated: text.modelGenerated,
          manuallyGenerated: text.manuallyGenerated,
        })}
      {objects &&
        showBadge(objects) &&
        row({
          status: objects.status,
          title: 'Object',
          icon: 'Scan',
          backgroundColor: '#FFE1D1',
          color: '#FF8746',
          modelGenerated: objects.modelGenerated,
          manuallyGenerated: objects.manuallyGenerated,
        })}
      {gdpr &&
        showGDPRBadge(gdpr) &&
        row({
          status: gdpr.status,
          title: 'People',
          icon: 'Personrounded',
          backgroundColor: '#D3F7FB',
          color: '#1AA3C1',
          modelGenerated: gdpr.modelGenerated,
          manuallyGenerated: gdpr.manuallyGenerated,
        })}
      {!showBadge(gdpr) &&
        !showBadge(tag) &&
        !showBadge(text) &&
        !showBadge(objects) && <>No annotations</>}
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
