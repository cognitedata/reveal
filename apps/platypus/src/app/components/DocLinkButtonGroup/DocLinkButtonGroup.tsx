import { Button } from '@cognite/cogs.js';
import { DOCS_LINKS } from '@platypus-app/constants';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import * as S from './elements';

export type DocLinkButtonGroupProps = {
  docsLinkUrl: string;
};

export const DocLinkButtonGroup = ({
  docsLinkUrl,
}: DocLinkButtonGroupProps) => {
  const { t } = useTranslation('DataModelHeader');

  return (
    <>
      <S.ButtonWrapper>
        <a href={DOCS_LINKS.CLI} target="_blank" rel="noreferrer">
          <Button
            aria-label={t('btn_link_cli_docs', 'CLI docs')}
            type="ghost"
            icon="CLI"
          />
        </a>
      </S.ButtonWrapper>
      <a href={docsLinkUrl} target="_blank" rel="noreferrer">
        <Button
          aria-label={t('btn_link_docs', 'Visit docs page')}
          type="ghost"
          icon="Documentation"
        />
      </a>
    </>
  );
};
