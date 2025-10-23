import { type ReactElement } from 'react';

import { Body, LoaderIcon } from '@cognite/cogs.js';

import { HORIZONTAL_SPACING, INDENTATION, LOADING_LABEL, VERTICAL_SPACING } from '../constants';

export const TreeViewLoading = ({
  level,
  label
}: {
  level?: number;
  label?: string;
}): ReactElement => {
  const horizontalSpacing = HORIZONTAL_SPACING + 'px';

  let marginVertical: string | undefined;
  let marginLeft: string | undefined;
  if (level !== undefined) {
    marginVertical = VERTICAL_SPACING + 'px';
    marginLeft = (level + 1) * INDENTATION + HORIZONTAL_SPACING + 'px';
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: horizontalSpacing,
        marginTop: marginVertical,
        marginBottom: marginVertical,
        marginLeft
      }}>
      <LoaderIcon style={{ marginTop: '2px' }} />
      <Body size="small" strong>
        {label ?? LOADING_LABEL}
      </Body>
    </div>
  );
};
