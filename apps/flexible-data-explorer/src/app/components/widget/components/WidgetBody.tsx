import { PropsWithChildren } from 'react';

import styled, { css } from 'styled-components';

import { useTranslation } from '../../../hooks/useTranslation';
import { EmptyState } from '../../EmptyState';
import { BaseWidgetProps } from '../Widget';

export const WidgetBody = ({
  children,
  state,
  fullWidth,
  noPadding,
}: PropsWithChildren<
  Pick<BaseWidgetProps, 'state' | 'fullWidth' | 'noPadding'>
>) => {
  const { t } = useTranslation();

  const renderContent = () => {
    if (state === 'empty') {
      return (
        <EmptyState
          title={t('WIDGET_EMPTY_TITLE')}
          body={t('WIDGET_EMPTY_BODY')}
        />
      );
    }

    if (state === 'loading') {
      return (
        <EmptyState
          title={t('WIDGET_LOADING_TITLE')}
          body={t('WIDGET_LOADING_BODY')}
        />
      );
    }
    return children;
  };

  return (
    <Container noPadding={noPadding} fullWidth={fullWidth}>
      {renderContent()}
    </Container>
  );
};

const Container = styled.div<Pick<BaseWidgetProps, 'fullWidth' | 'noPadding'>>`
  padding: ${(props) => (props.noPadding ? '0' : '16px')};
  height: 100%;
  overflow: auto;

  ${(props) => {
    if (props.fullWidth) {
      return css`
        padding: 0;
      `;
    }
  }}
`;
