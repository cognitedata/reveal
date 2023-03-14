import { Button, Tooltip } from '@cognite/cogs.js';
import { DOCS_LINKS } from '@platypus-app/constants';
import { TOKENS } from '@platypus-app/di';
import {
  useSelectedDataModelVersion,
  useDataModelVersions,
} from '@platypus-app/hooks/useDataModelActions';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { EndpointModal } from '@platypus-app/modules/solution/data-model/components/EndpointModal';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import * as S from './elements';

export type DocLinkButtonGroupProps = {
  docsLinkUrl: string;
  cliLink?: string;
};

export const DocLinkButtonGroup = ({
  docsLinkUrl,
  cliLink = DOCS_LINKS.CLI,
}: DocLinkButtonGroupProps) => {
  const { dataModelExternalId, space, version } = useParams() as {
    dataModelExternalId: string;
    space: string;
    version: string;
  };

  const { data: dataModelVersions } = useDataModelVersions(
    dataModelExternalId,
    space
  );
  const selectedDataModelVersion = useSelectedDataModelVersion(
    version,
    dataModelVersions || [],
    dataModelExternalId,
    space
  );
  const { t } = useTranslation('DataModelHeader');
  const [showEndpointModal, setShowEndpointModal] = useState(false);

  const fdmClient = useInjection(TOKENS.fdmClient);
  return (
    <>
      {showEndpointModal && (
        <EndpointModal
          endpoint={fdmClient.getQueryEndpointUrl(selectedDataModelVersion)}
          onRequestClose={() => setShowEndpointModal(false)}
        />
      )}
      <S.ButtonWrapper>
        <Tooltip content={t('cli_URL_tooltip', 'GraphQL URL')}>
          <Button
            icon="Link"
            type="ghost"
            data-cy="btn-endpoint-modal"
            onClick={() => setShowEndpointModal(true)}
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
          />
        </Tooltip>
      </a>
    </>
  );
};
