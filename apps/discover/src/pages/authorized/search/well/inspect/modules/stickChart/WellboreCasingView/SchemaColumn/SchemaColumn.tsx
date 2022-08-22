import React, { useCallback, useEffect, useRef, useState } from 'react';

import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';

import { WithDragHandleProps } from 'components/DragDropContainer';
import EmptyState from 'components/EmptyState';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';
import { FullWidth } from 'styles/layout';

import { ColumnDragger } from '../../../common/Events/ColumnDragger';
import {
  BodyColumn,
  BodyColumnBody,
  BodyColumnMainHeader,
} from '../../../common/Events/elements';
import { DepthScaleLines } from '../../components/DepthScaleLines';
import { CasingAssemblyView, CasingSchematicView } from '../../types';
import { getDepthValuesMap } from '../../utils/getDepthValuesMap';
import {
  DEFAULT_DEPTH_MEASUREMENT_TYPE,
  EMPTY_SCHEMA_TEXT,
  LOADING_TEXT,
} from '../constants';
import { ColumnHeaderWrapper } from '../elements';

import DepthColumn from './components/DepthColumn';
import { DepthIndicators } from './components/DepthIndicators';
import { DepthMeasurementTypeSelector } from './components/DepthMeasurementTypeSelector';
import { Legend } from './components/Legend';
import { TopContent } from './components/TopContent';
import {
  SchemaColumnContentWrapper,
  SchemaEmptyStateWrapper,
} from './elements';

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
    const depthIndicatorRef = useRef<HTMLElement>(null);

    const [overflow, setOverflow] = useState<string>('hidden');
    const [depthMeasurementType, setDepthMeasurementType] =
      useState<DepthMeasurementUnit>(DEFAULT_DEPTH_MEASUREMENT_TYPE);

    const depthValuesMap = useDeepMemo(
      () => getDepthValuesMap(casingAssemblies),
      [casingAssemblies]
    );

    const hasCasingAssembliesData = !isEmpty(casingAssemblies);
    const disableTVD = isEmpty(compact(Object.values(depthValuesMap)));

    /**
     * The widths are calculated using refs.
     * It takes some times to refs to assign to elements.
     * We can't see the depth markers during that time.
     * Hence, the width is taken as the full viewport width and overflow is hidden to hide excess width of lines.
     * Once the refs are set, the overflow value is set to visible.
     */
    const updateOverflow = useCallback(() => {
      if (depthIndicatorRef.current) {
        setOverflow('visible');
      } else {
        setOverflow('hidden');
      }
    }, [depthIndicatorRef.current]);

    useEffect(() => updateOverflow(), [updateOverflow]);

    const renderSchemaColumnContent = () => {
      if (!hasCasingAssembliesData || isLoading) {
        return (
          <SchemaEmptyStateWrapper>
            <EmptyState
              isLoading={isLoading}
              loadingSubtitle={isLoading ? LOADING_TEXT : ''}
              emptySubtitle={EMPTY_SCHEMA_TEXT}
              hideHeading
            />
          </SchemaEmptyStateWrapper>
        );
      }

      return (
        <>
          <DepthColumn
            scaleBlocks={scaleBlocks}
            depthValuesMap={depthValuesMap}
            depthMeasurementType={depthMeasurementType}
          />

          <FullWidth>
            <BodyColumnBody style={{ overflow }}>
              <DepthScaleLines scaleBlocks={scaleBlocks} />

              <TopContent
                rkbLevel={rkbLevel}
                waterDepth={waterDepth}
                scaleBlocks={scaleBlocks}
              />

              <DepthIndicators
                ref={depthIndicatorRef}
                casingAssemblies={casingAssemblies}
                scaleBlocks={scaleBlocks}
                showBothSides={showBothSides}
              />
            </BodyColumnBody>
          </FullWidth>
        </>
      );
    };

    return (
      <BodyColumn data-testid="schema-column" ref={ref}>
        <ColumnDragger {...dragHandleProps} />

        <ColumnHeaderWrapper>
          <DepthMeasurementTypeSelector
            selectedDepthMeasurementType={depthMeasurementType}
            onChangeDepthMeasurementType={setDepthMeasurementType}
            disableTVD={disableTVD}
          />
          <BodyColumnMainHeader>Schema</BodyColumnMainHeader>
          <Legend />
        </ColumnHeaderWrapper>

        <SchemaColumnContentWrapper>
          {renderSchemaColumnContent()}
        </SchemaColumnContentWrapper>
      </BodyColumn>
    );
  }
);
