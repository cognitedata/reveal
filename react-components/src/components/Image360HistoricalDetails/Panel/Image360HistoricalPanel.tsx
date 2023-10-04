/*!
 * Copyright 2023 Cognite AS
 */

import { Chip, Tooltip } from '@cognite/cogs.js';
import { type ReactElement } from 'react';
import styled from 'styled-components';
import { translations, useTranslation } from '../../../common/i18n';
import { I18nWrapper } from '@cognite/cdf-i18n-utils';

export type Image360HistoricalPanelProps = {
  revisionCount?: number;
  revisionDetailsExpanded: boolean;
  setRevisionDetailsExpanded: (detailed: boolean) => void;
};

export const Image360HistoricalPanel = ({
  revisionCount,
  revisionDetailsExpanded,
  setRevisionDetailsExpanded
}: Image360HistoricalPanelProps): ReactElement => {
  const { t } = useTranslation();
  const count = revisionCount?.toString();

  const onDetailsClick = (): void => {
    setRevisionDetailsExpanded(!revisionDetailsExpanded);
  };

  return (
    <I18nWrapper translations={translations} addNamespace="reveal-react-components">
      <Container isExpanded={revisionDetailsExpanded}>
        <Tooltip content="360 Image historical details">
          <StyledToolBar onClick={onDetailsClick} isExpanded={revisionDetailsExpanded}>
            {!revisionDetailsExpanded && (
              <>
                <StyledChip
                  icon="History"
                  iconPlacement="right"
                  label={t('IMAGES_360_DETAILS', 'Details')}
                  hideTooltip
                />
                <StyledChipCount label={count} hideTooltip />
              </>
            )}
            {revisionDetailsExpanded && (
              <StyledChip
                icon="PushRight"
                iconPlacement="right"
                label={t('IMAGES_360_DETAILS', 'Details')}
                hideTooltip
              />
            )}
          </StyledToolBar>
        </Tooltip>
      </Container>
    </I18nWrapper>
  );
};

const StyledToolBar = styled.div<{ isExpanded: boolean }>`
  left: 30px;
  bottom: 30px;
  display: flex;
  flex-direction: row;
  padding: 0px 0px 0px 5px;
  background: #ffffff;

  ${({ isExpanded }) =>
    isExpanded &&
    `
    padding: 0px 0px 0px 25px;
  `}
`;

const StyledChip = styled(Chip)`
  && {
    width: fit-content;
    min-height: 20px;
    max-height: 20px;
    background-color: white;
    border-radius: 2px;
    color: rgba(0, 0, 0, 0.9);
  }
  .cogs-chip__icon--right {
    transform: rotate(90deg);
  }
`;

const StyledChipCount = styled(Chip)`
  && {
    background: #5874ff;
    border-radius: 2px;
    width: fit-content;
    height: 20px;
    max-height: 20px;
    min-height: 20px;
    min-width: 20px;
    padding: 4px;
    color: #ffffff;

    /* Font */
    font-family: 'Inter';
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
  }
`;

const Container = styled.div<{ isExpanded: boolean }>`
  position: relative;
  left: calc(100% - 150px);
  width: 140px;
  height: 28px;
  background-color: white;
  padding: 4px 2px;
  align-items: center;
  display: flex;
  border-radius: 6px;

  ${({ isExpanded }) =>
    isExpanded &&
    `
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  `}
`;
