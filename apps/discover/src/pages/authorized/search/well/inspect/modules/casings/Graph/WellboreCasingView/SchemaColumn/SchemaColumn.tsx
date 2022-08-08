import React, { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import EmptyState from 'components/EmptyState';

import { BodyColumn } from '../../../../common/Events/elements';
import { CasingAssemblyView, CasingSchematicView } from '../../../types';
import { EMPTY_SCHEMA_TEXT, LOADING_TEXT } from '../../constants';

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
  casingAssemblies: CasingAssemblyView[];
  scaleBlocks: number[];
  showBothSides?: boolean;
}

export const SchemaColumn: React.FC<SchemaColumnProps> = ({
  rkbLevel,
  waterDepth,
  casingAssemblies,
  scaleBlocks,
  showBothSides = false,
}) => {
  const hasCasingAssembliesData = !isEmpty(casingAssemblies);

  /**
   * It takes a little time to calculate the depth scale.
   * The initial value of scaleBlocks is [0].
   * Once calculated, scaleBlocks should have at least two elements [0, maxDepth].
   * Hence, `scaleBlocks.length === 1` condition represents that the scale is being calculated.
   */
  const isScaleCalculating = useMemo(
    () => hasCasingAssembliesData && scaleBlocks.length === 1,
    [scaleBlocks]
  );

  const renderSchemaColumnContent = () => {
    if (!hasCasingAssembliesData || isScaleCalculating) {
      return (
        <EmptyState
          isLoading={isScaleCalculating}
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
    <BodyColumn data-testid="schema-column">
      <SchemaColumnHeaderWrapper>
        <HeaderText>Schema</HeaderText>
        <Legend />
      </SchemaColumnHeaderWrapper>

      <SchemaColumnContentWrapper>
        {renderSchemaColumnContent()}
      </SchemaColumnContentWrapper>
    </BodyColumn>
  );
};
