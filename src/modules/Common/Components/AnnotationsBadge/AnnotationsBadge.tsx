import React from 'react';
import { Body, Button, Icon } from '@cognite/cogs.js';
import {
  AnnotationCounts,
  AnnotationsBadgeCounts,
  AnnotationsBadgeStatuses,
  AnnotationStatuses,
} from '../../types';
import { showBadge, showGDPRBadge } from './common';

const setBadge = (counts: AnnotationCounts, statuses?: AnnotationStatuses) => {
  if (statuses?.status === 'Running') {
    return <Icon type="Loading" />;
  }
  if (statuses?.status === 'Failed') {
    return <Icon type="ErrorStroked" />;
  }

  const countList = [counts.modelGenerated, counts.manuallyGenerated].filter(
    (x) => x !== undefined
  );
  if (countList.length && statuses?.status !== 'Queued') {
    return String(countList.reduce((a, b) => (a || 0) + (b || 0)));
  }
  return '–';
};
const setOpacity = (status: string | undefined) =>
  status === 'Completed' || status === 'Running' || status === undefined
    ? 1.0
    : 0.5;

export function AnnotationsBadge(
  badgeCounts: AnnotationsBadgeCounts,
  badgeStatuses: AnnotationsBadgeStatuses
) {
  const showTag = showBadge(badgeCounts.tag, badgeStatuses.tag);
  const showText = showBadge(badgeCounts.text, badgeStatuses.text);
  const showObjects = showBadge(badgeCounts.objects, badgeStatuses.objects);
  const showGdpr = showGDPRBadge(badgeCounts.gdpr);
  return (
    <>
      {badgeCounts.tag && showTag && (
        <Button
          icon="ResourceAssets"
          size="small"
          style={{
            marginRight: '5px',
            backgroundColor: '#F4DAF8',
            color: '#C945DB',
            opacity: setOpacity(badgeStatuses.tag?.status),
          }}
        >
          {setBadge(badgeCounts.tag, badgeStatuses.tag)}
        </Button>
      )}
      {badgeCounts.text && showText && (
        <Button
          icon="TextScan"
          size="small"
          style={{
            marginRight: '5px',
            backgroundColor: '#F0FCF8',
            color: '#404040',
            opacity: setOpacity(badgeStatuses.text?.status),
          }}
        >
          {setBadge(badgeCounts.text, badgeStatuses.text)}
        </Button>
      )}
      {badgeCounts.objects && showObjects && (
        <Button
          icon="Scan"
          size="small"
          style={{
            marginRight: '5px',
            backgroundColor: '#FFE1D1',
            color: '#FF8746',
            opacity: setOpacity(badgeStatuses.objects?.status),
          }}
        >
          {setBadge(badgeCounts.objects, badgeStatuses.objects)}
        </Button>
      )}
      {badgeCounts.gdpr && showGdpr && (
        <Button
          icon="Personrounded"
          size="small"
          style={{
            backgroundColor: '#D3F7FB',
            color: '#1AA3C1',
            opacity: setOpacity(badgeStatuses.gdpr?.status),
          }}
        >
          {setBadge(badgeCounts.gdpr, badgeStatuses.gdpr)}
        </Button>
      )}
      {!showTag && !showText && !showObjects && !showGdpr && (
        <Body level={3}>No annotations</Body>
      )}
    </>
  );
}
