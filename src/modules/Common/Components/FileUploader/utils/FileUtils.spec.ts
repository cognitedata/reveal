import { renameDuplicates } from './FileUtils';

describe('accept', () => {
  it('should rename duplicated names', () => {
    expect(
      renameDuplicates([
        'img.png',
        'img.png',
        'img1.png',
        'img1.png',
        'img.png',
      ])
    ).toStrictEqual([
      'img.png',
      'img(1).png',
      'img1.png',
      'img1(1).png',
      'img(2).png',
    ]);

    expect(
      renameDuplicates(['img', 'img', 'img1.png', 'img1.png', 'img'])
    ).toStrictEqual(['img', 'img(1)', 'img1.png', 'img1(1).png', 'img(2)']);

    expect(
      renameDuplicates(['12.image.png', '12image.png', '12.image.png'])
    ).toStrictEqual(['12.image.png', '12image.png', '12.image(1).png']);
  });
});
