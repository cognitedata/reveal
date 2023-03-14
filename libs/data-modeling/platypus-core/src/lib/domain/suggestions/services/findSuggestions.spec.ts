import { findSuggestions } from './findSuggestions';

describe('FindSuggestionsTest', () => {
  it('should work', async () => {
    const sourceRecords = [
      { externalId: 'A1', a: 'AB-123-JK', b: 'DRR', x: { externalId: 'B1' } },
      { externalId: 'A2', a: 'VF-456-JK', b: 'DRR', x: null },
    ];
    const targetRecords = [
      { externalId: 'B1', c: 'AB123FR', b: 'DEF' },
      { externalId: 'B2', c: 'VF456GH', b: 'DRR' },
      { externalId: 'B3', c: 'VF456FR', b: 'DEF' },
    ];
    const suggestions = await findSuggestions({
      sourceRecords,
      targetRecords,
      fillColumn: 'x',
      sourceColumns: ['a', 'b'],
      targetColumns: ['b', 'c'],
    });
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].sourceExternalId).toBe('A2');
    expect(suggestions[0].targetExternalId).toBe('B3');
  });

  it('should work without any known targets', async () => {
    const sourceRecords = [
      { externalId: 'A1', a: 'AB-123-JK', x: null },
      { externalId: 'A2', a: 'VF-456-JK', x: null },
    ];
    const targetRecords = [
      { externalId: 'B1', a: 'AB123FR' },
      { externalId: 'B2', a: 'VF456FR' },
    ];
    const suggestions = await findSuggestions({
      sourceRecords,
      targetRecords,
      fillColumn: 'x',
      sourceColumns: ['a'],
      targetColumns: ['a'],
    });
    suggestions.sort((a, b) =>
      a.sourceExternalId.localeCompare(b.sourceExternalId)
    );
    expect(suggestions.length).toBe(2);

    expect(suggestions[0].sourceExternalId).toBe('A1');
    expect(suggestions[0].targetExternalId).toBe('B1');

    expect(suggestions[1].sourceExternalId).toBe('A2');
    expect(suggestions[1].targetExternalId).toBe('B2');
  });
});
