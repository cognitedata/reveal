import { useState } from 'react';

import { Button, Tooltip } from '@cognite/cogs.js';

import { DOCS_LINKS } from '../../constants';
import { useDMContext } from '../../context/DMContext';
import { TOKENS } from '../../di';
import { useInjection } from '../../hooks/useInjection';
import { useMixpanel } from '../../hooks/useMixpanel';
import { useTranslation } from '../../hooks/useTranslation';
import { EndpointModal } from '../../modules/solution/data-model/components/EndpointModal';

import * as S from './elements';

export type DocLinkButtonGroupProps = {
  docsLinkUrl: string;
  cliLink?: string;
};

export const DocLinkButtonGroup = ({
  docsLinkUrl,
  cliLink = DOCS_LINKS.CLI,
}: DocLinkButtonGroupProps) => {
  const { selectedDataModel } = useDMContext();

  const { track } = useMixpanel();

  const { t } = useTranslation('DataModelHeader');
  const [showEndpointModal, setShowEndpointModal] = useState(false);

  const fdmClient = useInjection(TOKENS.fdmClient);
  return (
    <>
      {showEndpointModal && (
        <EndpointModal
          endpoint={fdmClient.getQueryEndpointUrl(selectedDataModel)}
          onRequestClose={() => setShowEndpointModal(false)}
        />
      )}
      <S.ButtonWrapper>
        <Tooltip content={t('cli_URL_tooltip', 'GraphQL URL')}>
          <Button
            icon="Link"
            type="ghost"
            data-cy="btn-endpoint-modal"
            onClick={() => {
              track('DataModel.Links.GraphQL');
              setShowEndpointModal(true);
            }}
          >
            URL
          </Button>
        </Tooltip>
      </S.ButtonWrapper>
      <S.ButtonWrapper>
        <Tooltip content={t('cli_docs_tooltip', 'CLI')}>
          <a href={cliLink} target="_blank" rel="noreferrer">
            <Button
              aria-label={t('btn_link_cli_docs', 'CLI docs')}
              onClick={() => {
                track('DataModel.Links.CLI');
              }}
              type="ghost"
              icon="CLI"
            />
          </a>
        </Tooltip>
      </S.ButtonWrapper>
      <a href={docsLinkUrl} target="_blank" rel="noreferrer">
        <Tooltip content={t('docs_docs_tooltip', 'Documentation')}>
          <Button
            aria-label={t('btn_link_docs', 'Visit docs page')}
            type="ghost"
            icon="Documentation"
            onClick={() => {
              track('DataModel.Links.Documentation');
            }}
          />
        </Tooltip>
      </a>
    </>
  );
};
