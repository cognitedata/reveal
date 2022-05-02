import { sizes } from 'styles/layout';

import {
  MetadataTableContainer,
  MetadataContainer,
  Label,
  Value,
} from './elements';
import { formatItem, FormatItemProps } from './formatItem';

type MetaDataItemProps = {
  label?: string;
  actions?: JSX.Element | JSX.Element[];
  spacing?: keyof typeof sizes;
} & FormatItemProps;
export const MetadataItem: React.FC<MetaDataItemProps> = ({
  label,
  value,
  type,
  actions,
  spacing,
}) => {
  return (
    <MetadataContainer
      key={`metadata-label-${label}`}
      data-testid={`metadata-label-${label}`}
      spacing={spacing}
    >
      {label && <Label>{label}</Label>}
      <Value styles={{ display: 'flex' }}>
        {formatItem({ value, type, actions })}
      </Value>
    </MetadataContainer>
  );
};

export interface Props {
  metadata: MetaDataItemProps[];
  style?: Record<string, unknown>;
  columns?: number;
}
const MetadataTable: React.FC<Props> = ({
  metadata,
  style,
  columns,
  ...props
}) => {
  return (
    <MetadataTableContainer style={style} columns={columns} {...props}>
      {metadata.map((item) => (
        <MetadataItem
          key={item.label}
          label={item.label}
          value={item.value}
          type={item.type}
        />
      ))}
    </MetadataTableContainer>
  );
};

export default MetadataTable;
