import React from 'react';
import { Button, Icon } from '@cognite/cogs.js';
import {
  AnnotationsBadgeProps,
  ModelStatusAndAnnotationCounts,
} from 'src/pages/Workflow/types';

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
      {gdpr?.status && (
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
      {tag?.status && (
        <Button
          icon="Link"
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
      {textAndObjects?.status && (
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
      {!gdpr?.status && !tag?.status && !textAndObjects?.status && (
        <>No annotations</>
      )}
    </>
  );
}
