import { getColor, availableColors, getEntryColor, hexToRGBA } from './colors';

describe('Colors', () => {
  it('handles numbers', () => expect(getColor(1)).toBe(availableColors[1]));

  it('handles negative numbers', () =>
    expect(getColor(-1)).toBe(availableColors[availableColors.length - 1]));
});

describe('Stateful colors', () => {
  const chat1 = {
    id: 'chatId1',
    workflowCollection: ['workflowId1', 'workflowId2', 'workflowId3'],
  };
  const chat2 = {
    id: 'chatId2',
    workflowCollection: ['workflowId1', 'workflowId2', 'workflowId3'],
  };

  it('gives incrementing color from map', () => {
    expect(getEntryColor(chat1.id, chat1.workflowCollection[0])).toBe(
      availableColors[0]
    );
    expect(getEntryColor(chat1.id, chat1.workflowCollection[0])).toBe(
      availableColors[0]
    );
    expect(getEntryColor(chat1.id, chat1.workflowCollection[1])).toBe(
      availableColors[1]
    );
    expect(getEntryColor(chat1.id, chat1.workflowCollection[2])).toBe(
      availableColors[2]
    );
    expect(getEntryColor(chat2.id, chat2.workflowCollection[0])).toBe(
      availableColors[0]
    );
    expect(getEntryColor(chat2.id, chat2.workflowCollection[0])).toBe(
      availableColors[0]
    );
    expect(getEntryColor(chat2.id, chat2.workflowCollection[1])).toBe(
      availableColors[1]
    );
    expect(getEntryColor(chat2.id, chat2.workflowCollection[2])).toBe(
      availableColors[2]
    );
  });
});

describe('Hex to RGBA', () => {
  it('handles 6 char hex', () => {
    const rgba = hexToRGBA('#FFFFFF');

    expect(rgba).toBe(`rgba(255, 255, 255, 1)`);
  });

  it('handles 3 char hex', () => {
    const rgba = hexToRGBA('#FFF');

    expect(rgba).toBe(`rgba(255, 255, 255, 1)`);
  });

  it('handle alpha value', () => {
    const rgba = hexToRGBA('#FFF333', 0.5);
    expect(rgba).toBe('rgba(255, 243, 51, 0.5)');
  });

  it('does not handle hex without #', () => {
    const rgba = hexToRGBA('FFF');
    expect(rgba).toBe(null);
  });
});
