import { useTranslation } from 'react-i18next';

import styled from 'styled-components/macro';
import { shortDate } from 'utils/date';

import { Button } from '@cognite/cogs.js';

import { Typography } from 'components/typography';
import { generateReplyToUserContent } from 'modules/feedback/helper';
import { GeneralFeedbackItem } from 'modules/feedback/types';
import { Flex, sizes } from 'styles/layout';

const FeedbackDetailsTableContainer = styled.div`
  width: 100%;
  padding: ${sizes.medium};
  display: grid;
  row-gap: 15px;
`;

const FeedbackDetailsTableWrapper = styled.div`
  display: grid;
  row-gap: 10px;
`;

const FeedbackDetailsTableComment = styled.div`
  color: var(--cogs-text-color);
  background-color: var(--cogs-white);
`;

const FeedbackDetailsTableDetails = styled.div``;

const FeedbackDetailsTableDescription = styled(Typography)`
  margin-left: ${sizes.normal};
`;

interface props {
  feedback: GeneralFeedbackItem;
  deleted?: boolean;
}

export const GeneralFeedbackDetails: React.FC<props> = (props) => {
  const { feedback, deleted } = props;

  const handleReplyToUser = () => {
    const content = generateReplyToUserContent(feedback);
    if (content) {
      window.location.href = content;
    }
  };

  const comment = feedback.comment || '-';
  const { t } = useTranslation('Admin');

  return (
    <FeedbackDetailsTableContainer>
      <Typography variant="microheader">{t('USER COMMENT')}</Typography>
      <FeedbackDetailsTableWrapper>
        <FeedbackDetailsTableComment>
          <Typography variant="body2">{comment}</Typography>
        </FeedbackDetailsTableComment>
        <FeedbackDetailsTableDetails>
          <Flex>
            <Typography variant="tinytext">
              {t('Date')}: {shortDate(feedback.createdTime)}
            </Typography>
          </Flex>
          <FeedbackDetailsTableDescription variant="tinytext">
            <span>{t('Feedback ID')}:</span> <span>{feedback.id}</span>
          </FeedbackDetailsTableDescription>
        </FeedbackDetailsTableDetails>
      </FeedbackDetailsTableWrapper>
      {!deleted && (
        <Button onClick={handleReplyToUser}>{t('Reply to user')}</Button>
      )}
    </FeedbackDetailsTableContainer>
  );
};
