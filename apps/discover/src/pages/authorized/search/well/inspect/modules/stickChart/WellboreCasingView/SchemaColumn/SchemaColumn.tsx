import React from 'react';

import isEmpty from 'lodash/isEmpty';

import { WithDragHandleProps } from 'components/DragDropContainer';
import EmptyState from 'components/EmptyState';

import { ColumnDragger } from '../../../common/Events/ColumnDragger';
import { BodyColumn } from '../../../common/Events/elements';
import { CasingAssemblyView, CasingSchematicView } from '../../types';
import { EMPTY_SCHEMA_TEXT, LOADING_TEXT } from '../constants';

import { DepthIndicators } from './DepthIndicators';
import { DepthScaleLines } from './DepthScaleLines';
import {
  HeaderText,
  SchemaColumnContentWrapper,
  SchemaColumnHeaderWrapper,
} from './elements';
import { Legend } from './Legend';
import { TopContent } from './TopContent';

interface SchemaColumnProps
  extends Pick<CasingSchematicView, 'rkbLevel' | 'waterDepth'> {
  isLoading: boolean;
  casingAssemblies: CasingAssemblyView[];
  scaleBlocks: number[];
  showBothSides?: boolean;
}

export const SchemaColumn = React.forwardRef<
  HTMLElement,
  WithDragHandleProps<SchemaColumnProps>
>(
  (
    {
      isLoading,
      rkbLevel,
      waterDepth,
      casingAssemblies,
      scaleBlocks,
      showBothSides = false,
      ...dragHandleProps
    },
    ref
  ) => {
    const hasCasingAssembliesData = !isEmpty(casingAssemblies);

    const renderSchemaColumnContent = () => {
      if (!hasCasingAssembliesData || isLoading) {
        return (
          <EmptyState
            isLoading={isLoading}
            loadingSubtitle={LOADING_TEXT}
            emptySubtitle={EMPTY_SCHEMA_TEXT}
          />
        );
      }

      return (
        <>
          <DepthScaleLines scaleBlocks={scaleBlocks} />

          <TopContent
            rkbLevel={rkbLevel}
            waterDepth={waterDepth}
            scaleBlocks={scaleBlocks}
          />

          <DepthIndicators
            casingAssemblies={casingAssemblies}
            scaleBlocks={scaleBlocks}
            showBothSides={showBothSides}
          />
        </>
      );
    };

    return (
      <BodyColumn data-testid="schema-column" ref={ref}>
        <ColumnDragger {...dragHandleProps} />

        <SchemaColumnHeaderWrapper>
          <HeaderText>Schema</HeaderText>
          <Legend />
        </SchemaColumnHeaderWrapper>

        <SchemaColumnContentWrapper>
          {renderSchemaColumnContent()}
        </SchemaColumnContentWrapper>
      </BodyColumn>
    );
  }
);
