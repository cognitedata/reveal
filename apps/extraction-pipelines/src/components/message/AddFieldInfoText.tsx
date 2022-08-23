import React, { FunctionComponent, PropsWithChildren } from 'react';
import { Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useTranslation } from 'common';

interface AddFieldInfoTextProps {
  dataTestId?: string;
}

export const AddFieldInfoText: FunctionComponent<AddFieldInfoTextProps> = ({
  children,
  dataTestId,
}: PropsWithChildren<AddFieldInfoTextProps>) => {
  const { t } = useTranslation();

  return (
    <Styled>
      <Icon
        type="AddLarge"
        style={{ marginRight: '1rem' }}
        data-testId={dataTestId}
      />{' '}
      {t('add', { postProcess: 'lowercase' })} {children}
    </Styled>
  );
};

const Styled = styled.span`
  display: flex;
  align-items: center;
  line-height: 1.5rem;
  button:enabled > & {
    color: ${Colors.primary.hex()};
  }
`;
