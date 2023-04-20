import Tag from 'antd/lib/tag';
import { SectionTitle, TitleOrnament } from 'utils/styledComponents';
import { useTranslation } from 'common/i18n';
import { CopyButton } from '@cognite/cdf-utilities';

interface DataSetInfoProps {
  id?: string | number;
  name: string;
  description: string;
  labels?: string[];
}

const DataSetInfo = (props: DataSetInfoProps): JSX.Element => {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'inline' }}>
      <SectionTitle>{props.name}</SectionTitle>
      <TitleOrnament />
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontWeight: 'bold' }}>{t('id')}:</span> {props?.id}{' '}
        <CopyButton content={String(props?.id)} />
      </h3>
      <h3>
        <span style={{ fontWeight: 'bold' }}>{t('description')}:</span>{' '}
        {props.description}
      </h3>
      <br />
      {props.labels && props.labels.length ? (
        props.labels.map((label) => <Tag key={label}>{label}</Tag>)
      ) : (
        <p style={{ fontStyle: 'italic' }}>{t('no-labels')}</p>
      )}
    </div>
  );
};

export default DataSetInfo;
