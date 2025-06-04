import { Tooltip, CounterChip, Button } from '@cognite/cogs.js';
import { type ReactElement } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../../i18n/I18n';

export type Image360HistoricalPanelProps = {
  revisionCount?: number;
  revisionDetailsExpanded: boolean;
  setRevisionDetailsExpanded: (detailed: boolean) => void;
  fallbackLanguage?: string;
};

export const Image360HistoricalPanel = ({
  revisionCount,
  revisionDetailsExpanded,
  setRevisionDetailsExpanded,
  fallbackLanguage
}: Image360HistoricalPanelProps): ReactElement => {
  const { t } = useTranslation(fallbackLanguage);

  const onDetailsClick = (): void => {
    setRevisionDetailsExpanded(!revisionDetailsExpanded);
  };

  return (
    <Container isExpanded={revisionDetailsExpanded}>
      <Tooltip content={t({ key: 'IMAGES_360_DETAILS_TOOLTIP' })}>
        <StyledToolBar onClick={onDetailsClick} isExpanded={revisionDetailsExpanded}>
          {!revisionDetailsExpanded && (
            <StyledButton type="tertiary">
              {t({ key: 'IMAGES_360_DETAILS' })}
              <CounterChip counter={revisionCount} label={' Historic'} />
            </StyledButton>
          )}
          {revisionDetailsExpanded && (
            <StyledButton type="tertiary">{t({ key: 'IMAGES_360_DETAILS' })}</StyledButton>
          )}
        </StyledToolBar>
      </Tooltip>
    </Container>
  );
};

const StyledButton = styled(Button)`
  && {
    border-radius: 6px;
    border: 1px;
    width: fit-content;
    padding: 0px;
    grid-gap: 6px;

    font-family: 'Inter';
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
  }
`;

const StyledToolBar = styled.div<{ isExpanded: boolean }>`
  left: 30px;
  bottom: 30px;
  display: flex;
  flex-direction: row;
  background: #ffffff;
`;

const Container = styled.div<{ isExpanded: boolean }>`
  position: relative;
  left: calc(100% - 200px);
  width: fit-content;
  height: 28px;
  background-color: white;
  padding: 8px 10px;
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
