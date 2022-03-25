import Tag from 'antd/lib/tag';
import { SectionTitle, TitleOrnament } from 'utils/styledComponents';
import Typography from 'antd/lib/typography';

const { Text } = Typography;

interface DataSetInfoProps {
  id?: string | number;
  name: string;
  description: string;
  labels?: string[];
}

const DataSetInfo = (props: DataSetInfoProps): JSX.Element => {
  return (
    <div style={{ display: 'inline' }}>
      <SectionTitle>{props.name}</SectionTitle>
      <TitleOrnament />
      <h3>
        <span style={{ fontWeight: 'bold' }}>ID:</span>{' '}
        <Text copyable={{ text: String(props?.id) }}>{props?.id}</Text>
      </h3>
      <h3>
        <span style={{ fontWeight: 'bold' }}>Description:</span>{' '}
        {props.description}
      </h3>
      <br />
      {props.labels && props.labels.length ? (
        props.labels.map((label) => <Tag key={label}>{label}</Tag>)
      ) : (
        <p style={{ fontStyle: 'italic' }}>No labels</p>
      )}
    </div>
  );
};

export default DataSetInfo;
