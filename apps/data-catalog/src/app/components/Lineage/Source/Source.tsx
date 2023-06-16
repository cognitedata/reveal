import { FunctionComponent, PropsWithChildren } from 'react';

import { useTranslation } from '@data-catalog-app/common/i18n';
import {
  NoDataText,
  NoStyleList,
} from '@data-catalog-app/utils/styledComponents';

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
