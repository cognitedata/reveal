// Split user name based on parentheses.
// This will works only for one pair of parentheses.
// If there are more, then will return actual user name without splitting

export const getSplitUserName = (userName?: string) => {
  if (userName) {
    const splitWords = userName.split(/[()]/);
    if (splitWords.length === 3) {
      return { name: splitWords[0].trim(), subTitle: splitWords[1].trim() };
    }
  }

  return { name: userName, subTitle: '' };
};
