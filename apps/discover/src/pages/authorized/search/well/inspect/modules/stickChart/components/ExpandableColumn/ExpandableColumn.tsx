import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';

import isString from 'lodash/isString';

import { ExpandCollapseIconButton } from 'components/Buttons';
import { WithDragHandleProps } from 'components/DragDropContainer';
import { FlexGrow } from 'styles/layout';

import { ColumnDragger } from '../../../common/Events/ColumnDragger';
import { BodyColumnMainHeader } from '../../../common/Events/elements';

import {
  DEFAULT_COLUMN_WIDTH_COLLAPSED,
  DEFAULT_COLUMN_WIDTH_EXPANDED,
} from './constants';
import { BodyColumnWrapper, ExpandableColumnHeaderWrapper } from './elements';

export interface ExpandableColumnProps {
  header: string | JSX.Element;
  expanded?: boolean;
  widthCollapsed?: number;
  widthExpanded?: number;
  disableExpandButton?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
}

export const ExpandableColumn: React.FC<
  PropsWithChildren<WithDragHandleProps<ExpandableColumnProps>>
> = React.memo(
  ({
    header,
    expanded: expandedProp = false,
    widthCollapsed = DEFAULT_COLUMN_WIDTH_COLLAPSED,
    widthExpanded = DEFAULT_COLUMN_WIDTH_EXPANDED,
    disableExpandButton,
    onToggleExpand,
    children,
    ...dragHandleProps
  }) => {
    const [expanded, setExpanded] = useState(expandedProp);

    useEffect(() => {
      handleExpandCollapse(expandedProp);
    }, [expandedProp]);

    const handleExpandCollapse = useCallback(
      (expanded: boolean) => {
        setExpanded(expanded);
        onToggleExpand?.(expanded);
      },
      [onToggleExpand]
    );

    const renderHeader = () => {
      if (isString(header)) {
        return <BodyColumnMainHeader>{header}</BodyColumnMainHeader>;
      }
      return header;
    };

    return (
      <BodyColumnWrapper width={expanded ? widthExpanded : widthCollapsed}>
        <ColumnDragger {...dragHandleProps} />

        <ExpandableColumnHeaderWrapper>
          {renderHeader()}
          <FlexGrow />
          <ExpandCollapseIconButton
            expanded={expanded}
            disabled={disableExpandButton}
            onChange={handleExpandCollapse}
          />
        </ExpandableColumnHeaderWrapper>

        {children}
      </BodyColumnWrapper>
    );
  }
);
