/*!
 * Copyright 2025 Cognite AS
 */
import { type ReactElement } from 'react';

import { Body } from '@cognite/cogs-core';
import { LoaderIcon } from '@cognite/cogs-icons';

import { type AdvancedTreeViewProps } from '../advanced-tree-view-props';
import { HORIZONTAL_SPACING, INDENTATION, LOADING_LABEL, VERTICAL_SPACING } from '../constants';

type Props = AdvancedTreeViewProps & { level?: number };

export const TreeViewLoading = (props: Props): ReactElement => {
  const horizontalSpacing = HORIZONTAL_SPACING + 'px';

  let marginVertical: string | undefined;
  let marginLeft: string | undefined;
  if (props.level !== undefined) {
    marginVertical = VERTICAL_SPACING + 'px';
    marginLeft = (props.level + 1) * INDENTATION + HORIZONTAL_SPACING + 'px';
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
        {props.loadingLabel ?? LOADING_LABEL}
      </Body>
    </div>
  );
};
