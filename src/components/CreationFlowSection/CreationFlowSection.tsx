import Col from 'antd/lib/col';
import {
  IconWrapper,
  SectionCard,
  StatusTable,
  TitleOrnament,
  SectionTitle,
} from 'utils/styledComponents';

interface CreationFlowSectionProps {
  title: string;
  setSelection(): void;
  icon: string;
  columns: any;
  name: string;
}

// TODO CDFUX-1573 - figure out translation
const DataInStatusFields = [
  {
    field: 'Tell us which source your data comes from',
    key: 'source',
  },
  {
    field: 'Document any RAW tables used',
    key: 'raw',
  },
];

const TransformStatusFields = [
  {
    field: 'Document any transformations used',
    key: 'transform',
  },
];

const DocumentationStatusFields = [
  {
    field: 'Specify owner(s)',
    key: 'owners',
  },
  {
    field: 'Upload documentation or add links',
    key: 'docs',
  },
  {
    field: 'Set governance status',
    key: 'quality',
  },
];

export const CONSUMER_KEY = 'consumer';
const ConsumersStatusFields = [
  {
    field: 'Register consumer(s)',
    key: CONSUMER_KEY,
  },
];

const CreationFlowSection = (props: CreationFlowSectionProps): JSX.Element => {
  const getDataFields = () => {
    switch (props.name) {
      case 'GetDataIn':
        return DataInStatusFields;
      case 'Transformations':
        return TransformStatusFields;
      case 'Documentation':
        return DocumentationStatusFields;
      case 'Consumers':
        return ConsumersStatusFields;
      default:
        return [];
    }
  };
  return (
    <SectionCard onClick={() => props.setSelection()}>
      <SectionTitle>{props.title}</SectionTitle>
      <TitleOrnament />
      <Col span={24}>
        <Col span={18}>
          <StatusTable
            pagination={false}
            bordered
            columns={props.columns}
            dataSource={getDataFields()}
          />
        </Col>
        <Col span={6}>
          <IconWrapper>
            <img src={props.icon} alt={props.title} />
          </IconWrapper>
        </Col>
      </Col>
    </SectionCard>
  );
};

export default CreationFlowSection;
