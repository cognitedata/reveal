import { getColor, availableColors, getEntryColor } from './colors';

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
