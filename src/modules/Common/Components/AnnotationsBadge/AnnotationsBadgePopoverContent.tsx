import React from 'react';
import {
  AnnotationsBadgeCounts,
  AnnotationsBadgeStatuses,
} from 'src/modules/Common/types';
import styled from 'styled-components';
import { Button, Body, Detail, Micro } from '@cognite/cogs.js';
import { Divider } from '@cognite/data-exploration';
import {
  showBadge,
  showGDPRBadge,
} from 'src/modules/Common/Components/AnnotationsBadge/utils';

export function AnnotationsBadgePopoverContent(
  badgeCounts: AnnotationsBadgeCounts,
  badgeStatuses: AnnotationsBadgeStatuses
) {
  const row = (data: any, showFlag: boolean = false) => {
    return (
      <Container>
        <Button
          icon={data.icon}
          size="small"
          style={{
            marginRight: '17px',
            backgroundColor: data.backgroundColor,
            color: data.color,
          }}
          aria-label={`${data.title} icon`}
        />
        <Detail style={{ paddingRight: '22px' }}>
          {data.title} ({data.count})
        </Detail>
        {showFlag && (
          <Micro
            style={{
              background: '#EDF0FF',
              color: '#4255BB',
              padding: '4px',
              borderRadius: '4px',
            }}
          >
            Most frequent object
          </Micro>
        )}
      </Container>
    );
  };

  const showTag = showBadge(badgeCounts.assets, badgeStatuses.tag);
  const showText = showBadge(badgeCounts.text, badgeStatuses.text);
  const showObjects = showBadge(badgeCounts.objects, badgeStatuses.objects);
  const showGdpr = showGDPRBadge(badgeCounts.gdpr);

  const mostFrequentObjectCount = badgeCounts.mostFrequentObject
    ? badgeCounts.mostFrequentObject[1]
    : 0;
  return (
    <>
      {badgeCounts.mostFrequentObject !== undefined && showObjects && (
        <>
          {row(
            {
              title: '‘'.concat(badgeCounts.mostFrequentObject[0], '’'),
              icon: 'Scan',
              backgroundColor: '#FFE1D1',
              color: '#FF8746',
              count: mostFrequentObjectCount,
            },
            true
          )}
          <Divider.Horizontal />
        </>
      )}

      {badgeCounts.objects !== undefined &&
        showObjects &&
        row({
          title: mostFrequentObjectCount ? 'Other objects' : 'Objects',
          icon: 'Scan',
          backgroundColor: '#FFE1D1',
          color: '#FF8746',
          count: badgeCounts.objects - mostFrequentObjectCount,
        })}
      {badgeCounts.assets !== undefined &&
        showTag &&
        row({
          title: 'Assets',
          icon: 'Assets',
          backgroundColor: '#F4DAF8',
          color: '#C945DB',
          count: badgeCounts.assets,
        })}
      {badgeCounts.text !== undefined &&
        showText &&
        row({
          title: 'Text',
          icon: 'String',
          backgroundColor: '#F0FCF8',
          color: '#00665C',
          count: badgeCounts.text,
        })}

      {badgeCounts.gdpr !== undefined &&
        showGdpr &&
        row({
          title: 'People',
          icon: 'User',
          backgroundColor: '#D3F7FB',
          color: '#1AA3C1',
          count: badgeCounts.gdpr,
        })}
      {!showTag && !showText && !showObjects && !showGdpr && (
        <Body level={3}>No annotations</Body>
      )}
    </>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px;
`;
