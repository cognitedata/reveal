import { FunctionComponent, PropsWithChildren } from 'react';

import { Chip } from '@cognite/cogs.js';

import { useTranslation } from '../../../common/i18n';
import { NoDataText, NoStyleList } from '../../../utils';

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
