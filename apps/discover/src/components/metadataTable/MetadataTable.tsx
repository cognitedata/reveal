import {
  MetadataTableContainer,
  MetadataContainer,
  Label,
  Value,
} from './elements';
import { formatItem, FormatItemProps } from './formatItem';

type MetaDataItemProps = {
  label: string;
} & FormatItemProps;
export const MetadataItem: React.FC<MetaDataItemProps> = ({
  label,
  value,
  type,
}) => {
  return (
    <MetadataContainer
      key={`metadata-label-${label}`}
      data-testid={`metadata-label-${label}`}
    >
      <Label title={`${label}`}>{label}</Label>
      <Value title={`${value}`}>{formatItem({ value, type })}</Value>
    </MetadataContainer>
  );
};

export interface Props {
  metadata: MetaDataItemProps[];
  style?: Record<string, unknown>;
  columns?: number;
}
const MetadataTable: React.FC<Props> = ({ metadata, style, columns }) => {
  return (
    <MetadataTableContainer style={style} columns={columns}>
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
