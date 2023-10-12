import { CopyButton } from '@cognite/cdf-utilities';
import { Chip, Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../common/i18n';
import { SectionTitle, TitleOrnament } from '../../utils';

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
        <Flex gap={8}>
          {props.labels.map((label) => (
            <Chip hideTooltip size="x-small" key={label} label={label} />
          ))}
        </Flex>
      ) : (
        <p style={{ fontStyle: 'italic' }}>{t('no-labels')}</p>
      )}
    </div>
  );
};

export default DataSetInfo;
