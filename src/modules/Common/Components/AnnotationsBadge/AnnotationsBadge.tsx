import React from 'react';
import { Body, Button, Icon, Tooltip } from '@cognite/cogs.js';
import {
  AnnotationsBadgeCounts,
  AnnotationsBadgeStatuses,
  AnnotationStatuses,
} from 'src/modules/Common/types';
import { showBadge, showGDPRBadge } from './utils';

const setBadge = (count: number, statuses?: AnnotationStatuses) => {
  if (statuses?.status === 'Running') {
    return <Icon type="Loading" />;
  }
  if (statuses?.status === 'Failed') {
    if (statuses?.error) {
      return (
        <Tooltip placement="bottom" content={statuses.error}>
          <span style={{ width: '100px' }}>
            <Icon type="ErrorStroked" />
          </span>
        </Tooltip>
      );
    }
    return <Icon type="ErrorStroked" />;
  }

  if (count !== undefined && statuses?.status !== 'Queued') {
    return String(count);
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
  const showTag = showBadge(badgeCounts.assets, badgeStatuses.tag);
  const showText = showBadge(badgeCounts.text, badgeStatuses.text);
  const showObjects = showBadge(badgeCounts.objects, badgeStatuses.objects);
  const showGdpr = showGDPRBadge(badgeCounts.gdpr);
  return (
    <>
      {badgeCounts.assets !== undefined && showTag && (
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
          {setBadge(badgeCounts.assets, badgeStatuses.tag)}
        </Button>
      )}
      {badgeCounts.text !== undefined && showText && (
        <Button
          icon="TextScan"
          size="small"
          style={{
            marginRight: '5px',
            backgroundColor: '#F0FCF8',
            color: '#00665C',
            opacity: setOpacity(badgeStatuses.text?.status),
          }}
        >
          {setBadge(badgeCounts.text, badgeStatuses.text)}
        </Button>
      )}
      {badgeCounts.objects !== undefined && showObjects && (
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
      {badgeCounts.gdpr !== undefined && showGdpr && (
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
