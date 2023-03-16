import { useMemo } from 'react';
import { SelectProps, SelectComponents } from '@cognite/cogs.js';
import { OptionProps, components } from 'react-select';
import { chartSources } from 'models/chart/selectors';
import { useRecoilValue } from 'recoil';
import { SourceOption } from 'components/NodeEditor/V2/types';
import { SourceSelect } from 'components/Common/SidebarElements';
import { Source, SourceList } from 'domain/chart/types';
import { SourceIcon } from './SourceIcon';
import { SourceOptionContainer, EllipsesText } from './elements';

interface SourceOptionType extends OptionProps<Source, false> {
  data: SourceOption;
}

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
  onlyTimeseries,
  ...rest
}: Omit<SelectProps<Source>, 'options'> & {
  onlyTimeseries?: boolean;
}) => {
  const sources = useRecoilValue(chartSources);
  const options = useMemo<SourceList>(
    () =>
      onlyTimeseries
        ? sources.filter((source) => source.type === 'timeseries')
        : sources,
    [sources, onlyTimeseries]
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
      getOptionLabel={({ name }: Source) => name}
      getOptionValue={({ id }: Source) => id}
      // had to override because Cogs overrides this to just check .value of option
      isOptionSelected={(option?: Source) => option?.id === value?.id}
    />
  );
};
