import Col from 'antd/lib/col';
import { useTranslation } from 'common/i18n';
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

const CreationFlowSection = (props: CreationFlowSectionProps): JSX.Element => {
  const {
    DataInStatusFields,
    TransformStatusFields,
    DocumentationStatusFields,
    ConsumersStatusFields,
  } = useFields();

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

const useFields = () => {
  const { t } = useTranslation();
  const DataInStatusFields = [
    {
      field: t('creation-flow-field-source'),
      key: 'source',
    },
    {
      field: t('creation-flow-field-raw'),
      key: 'raw',
    },
  ];

  const TransformStatusFields = [
    {
      field: t('creation-flow-field-transform'),
      key: 'transform',
    },
  ];

  const DocumentationStatusFields = [
    {
      field: t('creation-flow-field-owners'),
      key: 'owners',
    },
    {
      field: t('creation-flow-field-docs'),
      key: 'docs',
    },
    {
      field: t('creation-flow-field-quality'),
      key: 'quality',
    },
  ];

  const ConsumersStatusFields = [
    {
      field: t('creation-flow-field-consumer'),
      key: 'consumer',
    },
  ];

  return {
    DataInStatusFields,
    TransformStatusFields,
    DocumentationStatusFields,
    ConsumersStatusFields,
  };
};

export default CreationFlowSection;
