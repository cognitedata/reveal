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
        <Button
          aria-label={t('btn_link_cli_docs', 'CLI docs')}
          href={DOCS_LINKS.CLI}
          type="ghost"
          icon="CLI"
          target="_blank"
        />
      </S.ButtonWrapper>
      <Button
        aria-label={t('btn_link_docs', 'Visit docs page')}
        href={docsLinkUrl}
        type="ghost"
        icon="Documentation"
        target="_blank"
      />
    </>
  );
};
