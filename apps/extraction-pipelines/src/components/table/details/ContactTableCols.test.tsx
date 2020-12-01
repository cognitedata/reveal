import { showCancelSave, showEditRemove } from './ContactTableCols';

describe('ContactTableCols', () => {
  test('showEditRemove - not show when expanded and editable', () => {
    const row = {
      isExpanded: true,
      original: {
        isEditable: true,
      },
    };
    const res = showEditRemove(row);
    expect(res).toEqual(false);
  });

  test('showEditRemove - show when is editable and not expanded', () => {
    const row = {
      isExpanded: false,
      original: {
        isEditable: true,
      },
    };
    const res = showEditRemove(row);
    expect(res).toEqual(true);
  });

  test('showEditRemove - not show not editable', () => {
    const row = {
      isExpanded: false,
      original: {
        isEditable: false,
      },
    };
    const res = showEditRemove(row);
    expect(res).toEqual(false);
  });
  test('showCancelSave - not show when not expanded', () => {
    const row = {
      isExpanded: false,
      original: {
        isEditable: true,
      },
    };
    const res = showCancelSave(row);
    expect(res).toEqual(false);
  });

  test('showCancelSave - show when expanded and editable', () => {
    const row = {
      isExpanded: true,
      original: {
        isEditable: true,
      },
    };
    const res = showCancelSave(row);
    expect(res).toEqual(true);
  });

  test('showCancelSave - not show when not editable', () => {
    const row = {
      isExpanded: true,
      original: {
        isEditable: false,
      },
    };
    const res = showCancelSave(row);
    expect(res).toEqual(false);
  });
});
