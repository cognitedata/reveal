import { useMemo } from 'react';
import { SelectProps, SelectComponents } from '@cognite/cogs.js';
import { OptionProps, components } from 'react-select';
import { useChartSourcesValue } from 'models/chart/selectors';
import { SourceOption } from 'components/NodeEditor/V2/types';
import { SourceSelect } from 'components/Common/SidebarElements';
import { ChartSource, SourceType } from 'models/chart/types';
import { SourceIcon } from './SourceIcon';
import { SourceOptionContainer, EllipsesText } from './elements';

interface SourceOptionType extends OptionProps<ChartSource, false> {
  data: SourceOption;
}

type SourceSelectorType = Omit<SelectProps<ChartSource>, 'options'> & {
  selectableSourceTypes?: SourceType[];
};

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
