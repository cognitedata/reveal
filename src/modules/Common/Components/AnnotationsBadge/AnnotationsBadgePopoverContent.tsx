import React from 'react';

import styled from 'styled-components';
import { Button, Title, Body, Icon } from '@cognite/cogs.js';
import { Divider } from '@cognite/data-exploration';
import { JobStatus } from 'src/api/types';
import { showBadge, showGDPRBadge } from './common';
import { AnnotationsBadgeCounts, AnnotationsBadgeStatuses } from '../../types';

export function AnnotationsBadgePopoverContent(
  badgeCounts: AnnotationsBadgeCounts,
  badgeStatuses: AnnotationsBadgeStatuses
) {
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

  const showTag = showBadge(badgeCounts.tag, badgeStatuses.tag);
  const showText = showBadge(badgeCounts.text, badgeStatuses.text);
  const showObjects = showBadge(badgeCounts.objects, badgeStatuses.objects);
  const showGdpr = showGDPRBadge(badgeCounts.gdpr);

  return (
    <>
      <Body level={1}> Detections </Body>
      <Divider.Horizontal />
      {badgeCounts.tag &&
        showTag &&
        row({
          status: badgeStatuses.tag?.status,
          title: 'Asset',
          icon: 'ResourceAssets',
          backgroundColor: '#F4DAF8',
          color: '#C945DB',
          modelGenerated: badgeCounts.tag.modelGenerated,
          manuallyGenerated: badgeCounts.tag.manuallyGenerated,
        })}
      {badgeCounts.text &&
        showText &&
        row({
          status: badgeStatuses.text?.status,
          title: 'Text',
          icon: 'TextScan',
          backgroundColor: '#F0FCF8',
          color: '#00665C',
          modelGenerated: badgeCounts.text.modelGenerated,
          manuallyGenerated: badgeCounts.text.manuallyGenerated,
        })}
      {badgeCounts.objects &&
        showObjects &&
        row({
          status: badgeStatuses.objects?.status,
          title: 'Object',
          icon: 'Scan',
          backgroundColor: '#FFE1D1',
          color: '#FF8746',
          modelGenerated: badgeCounts.objects.modelGenerated,
          manuallyGenerated: badgeCounts.objects.manuallyGenerated,
        })}
      {badgeCounts.gdpr &&
        showGdpr &&
        row({
          status: badgeStatuses.gdpr?.status,
          title: 'People',
          icon: 'Personrounded',
          backgroundColor: '#D3F7FB',
          color: '#1AA3C1',
          modelGenerated: badgeCounts.gdpr.modelGenerated,
          manuallyGenerated: badgeCounts.gdpr.manuallyGenerated,
        })}
      {!showTag && !showText && !showObjects && !showGdpr && (
        <Body level={3}>No annotations</Body>
      )}
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
