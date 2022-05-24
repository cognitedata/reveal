import { FunctionComponent, PropsWithChildren } from 'react';
import Tag from 'antd/lib/tag';
import { NoDataText, NoStyleList } from 'utils/styledComponents';
import { useTranslation } from 'common/i18n';

export interface SourceProps {
  sourceNames?: string[];
}

export const Source: FunctionComponent<SourceProps> = ({
  sourceNames,
}: PropsWithChildren<SourceProps>) => {
  const { t } = useTranslation();
  return (
    <NoStyleList>
      {sourceNames ? (
        sourceNames.map((sourceName) => (
          <li key={sourceName}>
            <Tag>{sourceName}</Tag>
          </li>
        ))
      ) : (
        <NoDataText>{t('no-source-set')}</NoDataText>
      )}
    </NoStyleList>
  );
};
