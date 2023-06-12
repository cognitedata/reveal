import { FunctionComponent, PropsWithChildren } from 'react';
import { NoDataText, NoStyleList } from 'utils/styledComponents';
import { useTranslation } from 'common/i18n';
import { Chip } from '@cognite/cogs.js';

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
            <Chip label={sourceName} size="x-small" hideTooltip />
          </li>
        ))
      ) : (
        <NoDataText>{t('no-source-set')}</NoDataText>
      )}
    </NoStyleList>
  );
};
