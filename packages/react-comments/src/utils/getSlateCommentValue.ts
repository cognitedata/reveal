import { MessageType } from '@cognite/cogs.js';

import { CommentData } from '../Components/Richtext';

export const getSlateCommentValue = (
  comment: MessageType['text']
): CommentData => {
  let slateValue: CommentData;

  try {
    if (
      // here we are trying to catch old data that is not in slate format
      // and for comments that are numbers, we need to force them to skip the json conversion attempt
      // because they are valid json and will not fail
      typeof comment === 'number' ||
      String(Number(comment)) === comment
    ) {
      throw new Error('Skip JSON parse attempt'); // since it will pass
    }
    slateValue = JSON.parse(String(comment)) as CommentData;
  } catch {
    slateValue = [
      {
        type: 'paragraph',
        children: [
          {
            text: `${comment}`,
          },
        ],
      },
    ];
  }

  return slateValue;
};
