import React from 'react';
import { Button, Icon } from '@cognite/cogs.js';
import {
  AnnotationsBadgeProps,
  ModelStatusAndAnnotationCounts,
} from 'src/modules/Workflow/types';

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
  text,
  objects,
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
      {tag && showBadge(tag) && (
        <Button
          icon="ResourceAssets"
          size="small"
          style={{
            marginRight: '5px',
            backgroundColor: '#F4DAF8',
            color: '#C945DB',
            opacity: setOpacity(tag?.status),
          }}
        >
          {setBadge(tag)}
        </Button>
      )}
      {text && showBadge(text) && (
        <Button
          icon="TextScan"
          size="small"
          style={{
            marginRight: '5px',
            backgroundColor: '#F0FCF8',
            color: '#404040',
            opacity: setOpacity(text?.status),
          }}
        >
          {setBadge(text)}
        </Button>
      )}
      {objects && showBadge(objects) && (
        <Button
          icon="Scan"
          size="small"
          style={{
            marginRight: '5px',
            backgroundColor: '#FFE1D1',
            color: '#FF8746',
            opacity: setOpacity(objects?.status),
          }}
        >
          {setBadge(objects)}
        </Button>
      )}
      {gdpr && showGDPRBadge(gdpr) && (
        <Button
          icon="Personrounded"
          size="small"
          style={{
            backgroundColor: '#D3F7FB',
            color: '#1AA3C1',
            opacity: setOpacity(gdpr?.status),
          }}
        >
          {setBadge(gdpr)}
        </Button>
      )}
      {!showBadge(gdpr) &&
        !showBadge(tag) &&
        !showBadge(text) &&
        !showBadge(objects) && <>No annotations</>}
    </>
  );
}
