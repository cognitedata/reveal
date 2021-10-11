import { getLeftAndRightTextLength, getNewText } from '../utils';

const textContent = 'this is a very long text to read';

describe('Middle ellipsis utils', () => {
  it('get New text from left and right character count', () => {
    const newText = getNewText(textContent, 5, 15);
    expect('this  ... long text to read').toEqual(newText);
  });

  it('get left and right character count', () => {
    const { leftEnd, rightStart } = getLeftAndRightTextLength(textContent, {
      parentWidth: 150,
      targetWidth: 200,
    });
    expect(leftEnd).toEqual(13);
    expect(rightStart).toEqual(19);
  });
});
