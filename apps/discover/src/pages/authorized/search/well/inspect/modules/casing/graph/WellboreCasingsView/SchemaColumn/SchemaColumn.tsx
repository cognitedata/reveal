import React from 'react';

import { CasingAssemblyView, CasingsView } from '../../../types';

import { DepthIndicators } from './DepthIndicators';
import { DepthScaleLines } from './DepthScaleLines';
import {
  HeaderText,
  SchemaColumnContentWrapper,
  SchemaColumnHeaderWrapper,
  SchemaColumnWrapper,
} from './elements';
import { Legend } from './Legend';
import { TopContent } from './TopContent';

interface SchemaColumnProps
  extends Pick<CasingsView, 'rkbLevel' | 'waterDepth'> {
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
  return (
    <SchemaColumnWrapper data-testid="schema-column">
      <SchemaColumnHeaderWrapper>
        <HeaderText>Schema</HeaderText>
        <Legend />
      </SchemaColumnHeaderWrapper>

      <SchemaColumnContentWrapper>
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
      </SchemaColumnContentWrapper>
    </SchemaColumnWrapper>
  );
};
