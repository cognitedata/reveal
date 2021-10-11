const PADDING_OFFSET_TO_ALLIGN_TEXT = 5;
const LEFT_AND_RIGHT_SIDES = 2;

interface ContainersWidth {
  parentWidth: number;
  targetWidth: number;
}

export const updateTextWithMiddleEllipsis = (
  parentNode: HTMLElement,
  childNode: HTMLElement
) => {
  const targetWidth = childNode.offsetWidth;
  const parentWidth = parentNode.offsetWidth;

  const isTextLagerThanParent = targetWidth > parentWidth;
  const isBothContainersEqual = targetWidth === parentWidth;

  if (isBothContainersEqual) return;

  if (isTextLagerThanParent) {
    const containersWidth = { parentWidth, targetWidth };
    updateChildNodeText(childNode, containersWidth);
  }
};

const updateChildNodeText = (
  childNode: HTMLElement,
  containersWidth: ContainersWidth
) => {
  const textContent = getOriginalText(childNode) || childNode.textContent || '';

  const { leftEnd, rightStart } = getLeftAndRightTextLength(
    textContent,
    containersWidth
  );
  // eslint-disable-next-line no-param-reassign
  childNode.textContent = getNewText(textContent, leftEnd, rightStart);
};

const getOriginalText = (node: HTMLElement) => node.getAttribute('title');

export const getLeftAndRightTextLength = (
  textContent: string,
  containersWidth: ContainersWidth
) => {
  const { parentWidth } = containersWidth;

  const originalTextCount = textContent.length;
  const avgLetterSize = parentWidth / originalTextCount;

  const canFitLetterCount = parentWidth / avgLetterSize;

  const eachSideCutoffWidth = getCutOffSizesForSides(
    originalTextCount,
    canFitLetterCount
  );
  return getLeftEndAndRightStart(originalTextCount, eachSideCutoffWidth);
};

export const getCutOffSizesForSides = (
  originalTextCount: number,
  canFitLetterCount: number
) =>
  (originalTextCount - canFitLetterCount + PADDING_OFFSET_TO_ALLIGN_TEXT) /
  LEFT_AND_RIGHT_SIDES;

export const getLeftEndAndRightStart = (
  originalTextCount: number,
  eachSideCutoffWidth: number
) => {
  const leftEnd = Math.floor(
    originalTextCount / LEFT_AND_RIGHT_SIDES - eachSideCutoffWidth
  );
  const rightStart = Math.ceil(
    originalTextCount / LEFT_AND_RIGHT_SIDES + eachSideCutoffWidth
  );
  return { leftEnd, rightStart };
};

export const getNewText = (
  textContent: string,
  leftEnd: number,
  rightStart: number
) => {
  return `${textContent.substr(0, leftEnd)} ... ${textContent.substr(
    rightStart
  )}`;
};
