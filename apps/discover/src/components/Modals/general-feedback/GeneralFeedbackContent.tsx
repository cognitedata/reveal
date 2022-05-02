import React from 'react';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components/macro';

import { Textarea } from '@cognite/cogs.js';

import { Typography } from 'components/Typography';
import { APP_NAME } from 'constants/general';

const InfoBox = styled.div`
  background-color: var(--cogs-greyscale-grey3);
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
`;

export interface Props {
  handleTextChange: (value: string) => void;
}

export const GeneralFeedbackContent: React.FC<Props> = (props) => {
  const { handleTextChange } = props;
  const [text, setText] = React.useState('');
  const { t } = useTranslation();
  return (
    <div>
      <Textarea
        data-testid="general-feedback-input"
        style={{ height: '200px' }}
        value={text}
        placeholder={t('Feedback')}
        onChange={(e) => {
          const { value } = e.target;
          handleTextChange(value);
          setText(value);
        }}
      />
      <InfoBox>
        <Typography variant="microheader">
          {t(`By sending feedback to ${APP_NAME} you are accepting
          that the current search query and results are stored along with your
          user details in order to improve the search results. `)}
        </Typography>
      </InfoBox>
    </div>
  );
};
