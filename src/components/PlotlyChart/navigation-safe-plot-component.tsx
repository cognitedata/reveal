import React, { ComponentType, memo } from 'react';
import { shallowCompareProperties } from 'utils/compare';
import { PlotWrapper } from './elements';
import { useDebouncePropsOnNavigation } from './hooks';

export function createNavigationSafePlotComponent<P>(
  plotlyComponent: ComponentType<P>
): typeof plotlyComponent {
  const MemoizedPlot = memo(plotlyComponent as any, shallowCompareProperties);

  const SafePlotlyComponent = (
    props: React.ComponentProps<typeof plotlyComponent>
  ) => {
    const debouncedPlotProps = useDebouncePropsOnNavigation(props);

    return (
      <PlotWrapper>
        <MemoizedPlot {...debouncedPlotProps} />
      </PlotWrapper>
    );
  };

  return SafePlotlyComponent;
}
