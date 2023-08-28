import React from 'react';

import styled from 'styled-components';

import { PageTitle } from '@cognite/cdf-utilities';
import { Button, Infobox } from '@cognite/cogs.js';

import { translationKeys } from '../common/i18n/translationKeys';
import { useTranslation } from '../hooks/useTranslation';

type NoAccessToCurrentCanvasProps = {
  onGoBackClick: () => void;
};

const NoAccessToCurrentCanvas: React.FC<NoAccessToCurrentCanvasProps> = ({
  onGoBackClick,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <PageTitle title="Industrial Canvas" />
      <ErrorMessageWrapper>
        <Infobox
          type="danger"
          title={t(
            translationKeys.CANVAS_VISIBILITY_ERROR_TITLE,
            'This canvas is not visible to you'
          )}
        >
          {t(
            translationKeys.CANVAS_VISIBILITY_ERROR_MESSAGE,
            'This is a private canvas which is not shared with you.'
          )}
        </Infobox>
        <Button
          icon="ArrowLeft"
          aria-label={t(
            translationKeys.CANVAS_VISIBILITY_ERROR_BUTTON,
            'Go to Industrial Canvas home page'
          )}
          onClick={onGoBackClick}
        >
          {t(
            translationKeys.CANVAS_VISIBILITY_ERROR_BUTTON,
            'Go to Industrial Canvas home page'
          )}
        </Button>
      </ErrorMessageWrapper>
    </>
  );
};

const ErrorMessageWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .cogs-infobox {
    max-width: 500px;
  }

  .cogs.cogs-button {
    margin-top: 8px;
  }
`;

export default NoAccessToCurrentCanvas;
