import 'jest-canvas-mock';
import { splitTextBasedCharacter } from 'Three/Utilities/Canvas';

describe('splitTextBasedCharacter', () => {
  let context: any;
  beforeEach(() => {
    const canvas = document.createElement('canvas');
    context = canvas.getContext('2d');
  });

  test('should return, space based split text', () => {
    const text = 'testing text';
    const { splittingCharacter, splitText } = splitTextBasedCharacter(
      context,
      text,
      text.length
    );

    expect(splittingCharacter).toEqual(' ');
    expect(splitText).toMatchObject(text.split(' '));
  });

  test('should return character based split text', () => {
    const text =
      'testing_text testing_text/testing_text/testing_text/testing_text/testing_text/';
    const { splittingCharacter, splitText } = splitTextBasedCharacter(
      context,
      text,
      text.length / 2
    );

    expect(splittingCharacter).toEqual('');
    expect(splitText).toMatchObject(text.split(''));
  });
});
