import { useMemo } from 'react';
import { OptionProps, components } from 'react-select';

import { SourceSelect } from '@charts-app/components/Common/SidebarElements';
import { SourceOption } from '@charts-app/components/NodeEditor/V2/types';
import { useChartSourcesValue } from '@charts-app/models/chart/selectors';
import { ChartSource, SourceType } from '@charts-app/models/chart/types';

import { SelectProps, SelectComponents } from '@cognite/cogs.js';

import { SourceOptionContainer, EllipsesText } from './elements';
import { SourceIcon } from './SourceIcon';

interface SourceOptionType extends OptionProps<ChartSource, false> {
  data: SourceOption;
}

type SourceSelectorType = Omit<SelectProps<ChartSource>, 'options'> & {
  selectableSourceTypes?: SourceType[];
};

// TODO (AH-1653): Group styles is not working properly, keeping the commented code for now
// type GroupedOptionType = {
//   label: SourceType;
//   options: ChartSource[];
// };

const Option = (props: SourceOptionType) => {
  return (
    <components.Option {...props}>
      <SourceOptionContainer justifyContent="start" alignItems="center">
        <SourceIcon color={props.data.color} type={props.data.type} />
        <EllipsesText>{props.children}</EllipsesText>
      </SourceOptionContainer>
    </components.Option>
  );
};

export const SourceSelector = ({
  value,
  selectableSourceTypes = ['timeseries', 'workflow'],
  ...rest
}: SourceSelectorType) => {
  const sources = useChartSourcesValue();

  const options = useMemo<ChartSource[]>(
    () =>
      sources.filter((source) =>
        source.type ? selectableSourceTypes.includes(source.type) : true
      ),
    [sources, selectableSourceTypes]
  );

  // TODO (AH-1653): Group styles is not working properly, keeping the commented code for now
  // const groupedOptions: GroupedOptionType[] = useMemo<
  //   GroupedOptionType[]
  // >(() => {
  //   const grouped: Record<string, ChartSource[]> = {};

  //   sources.forEach((source) => {
  //     if (source.type && selectableSourceTypes.includes(source.type)) {
  //       if (!grouped[source.type]) {
  //         grouped[source.type] = [];
  //       }

  //       grouped[source.type].push(source);
  //     }
  //   });

  //   return Object.keys(grouped).map((type) => ({
  //     label: type as SourceType,
  //     options: grouped[type as SourceType],
  //   }));
  // }, [sources, selectableSourceTypes]);

  // const formatGroupLabel = (data: GroupedOptionType) => data.label;

  return (
    <SourceSelect
      {...rest}
      title={<SourceIcon color={value?.color || '#ccc'} type={value?.type} />}
      components={{
        ...SelectComponents,
        Option,
      }}
      value={value}
      options={options}
      getOptionLabel={({ name }: ChartSource) => name}
      getOptionValue={({ id }: ChartSource) => id}
      // had to override isOptionSelected because Cogs overrides this to just check .value instead of getOptionValue
      isOptionSelected={(option?: ChartSource) => option?.id === value?.id}
    />
  );
};
