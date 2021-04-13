import React from 'react';
import { Button, Icon } from '@cognite/cogs.js';
import {
  AnnotationsBadgeProps,
  ModelStatusAndAnnotationCounts,
} from 'src/pages/Workflow/types';

export const showBadge = (
  badgeCounts: ModelStatusAndAnnotationCounts | undefined
) => {
  return badgeCounts?.manuallyGenerated || badgeCounts?.status;
};

export const showGDPRBadge = (
  badgeCounts: ModelStatusAndAnnotationCounts | undefined
) => {
  return !!(badgeCounts?.modelGenerated && badgeCounts?.modelGenerated > 0);
};
export function AnnotationsBadge({
  gdpr,
  tag,
  textAndObjects,
}: AnnotationsBadgeProps) {
  const setBadge = ({ status, ...counts }: ModelStatusAndAnnotationCounts) => {
    if (status === 'Running') {
      return <Icon type="Loading" />;
    }
    if (status === 'Failed') {
      return <Icon type="ErrorStroked" />;
    }

    const countList = [counts.modelGenerated, counts.manuallyGenerated].filter(
      (x) => x !== undefined
    );
    if (countList.length && status !== 'Queued') {
      return String(countList.reduce((a, b) => (a || 0) + (b || 0)));
    }
    return '–';
  };
  const setOpacity = (status: string | undefined) =>
    status === 'Completed' || status === 'Running' ? 1.0 : 0.5;

  return (
    <>
      {gdpr && showGDPRBadge(gdpr) && (
        <Button
          icon="WarningFilled"
          size="small"
          style={{
            marginRight: '5px',
            backgroundColor: '#FBE9ED',
            color: '#B30539',
            opacity: setOpacity(gdpr.status),
          }}
        >
          {setBadge(gdpr)}
        </Button>
      )}
      {tag && showBadge(tag) && (
        <Button
          icon="ResourceAssets"
          size="small"
          style={{
            marginRight: '5px',
            backgroundColor: '#F4DAF8',
            color: '#C945DB',
            opacity: setOpacity(tag.status),
          }}
        >
          {setBadge(tag)}
        </Button>
      )}
      {textAndObjects && showBadge(textAndObjects) && (
        <Button
          icon="Scan"
          size="small"
          style={{
            backgroundColor: '#FFE1D1',
            color: '#FF8746',
            opacity: setOpacity(textAndObjects?.status),
          }}
        >
          {setBadge(textAndObjects)}
        </Button>
      )}
      {!showBadge(gdpr) && !showBadge(tag) && !showBadge(textAndObjects) && (
        <>No annotations</>
      )}
    </>
  );
}
