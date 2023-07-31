import { shortDate } from 'utils/date';

import {
  GeneralFeedbackResponse,
  ObjectFeedbackResponse,
} from '@cognite/discover-api-types';

import { APP_NAME } from 'constants/general';
import { getFullNameOrDefaultText } from 'modules/user/utils';

function shortCommentText(
  text: string,
  minNumberCharacters = 35,
  maxNumberCharacters = minNumberCharacters + 10
) {
  if (text.length <= minNumberCharacters) {
    return text;
  }
  const modifiedText = text.substring(0, maxNumberCharacters);
  let numberWords = modifiedText.split(' ').length;
  let characterWordRatio = modifiedText.length / numberWords;
  if (text.length <= maxNumberCharacters && characterWordRatio < 6) {
    return text;
  }
  let lastIndex = modifiedText.lastIndexOf(' ');
  let shortText = modifiedText.substring(0, lastIndex);
  numberWords = shortText.split(' ').length;
  characterWordRatio = shortText.length / numberWords;
  if (characterWordRatio >= 6) {
    lastIndex = shortText.lastIndexOf(' ');
    shortText = shortText.substring(0, lastIndex);
  }
  return `${shortText} ...`;
}

export const feedbackHelper = {
  shortCommentText,
};

type FeedbackType = GeneralFeedbackResponse | ObjectFeedbackResponse;

export const generateReplyToUserContent = (feedback: FeedbackType) => {
  const subject = `${APP_NAME} feedback with ID ${feedback.id} is now being handled.`;
  const name = getFullNameOrDefaultText(feedback.user);
  const date = shortDate(feedback.createdTime);
  const newLine = '%0D%0A';
  const body = `Hello ${name},${newLine}${newLine}We would like to inform you that we are handling the feedback you left on ${APP_NAME} on ${date}${
    feedback.comment
      ? ` with the following text:${newLine}"${feedback.comment}".`
      : '.'
  }`;

  return (
    feedback.user &&
    `mailto:${feedback.user.email || ''}?subject=${subject}&body=${body}`
  );
};
