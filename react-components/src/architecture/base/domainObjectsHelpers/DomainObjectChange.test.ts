/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { Changes } from './Changes';
import { DomainObjectChange } from './DomainObjectChange';
import { ChangedDescription } from './ChangedDescription';

describe(DomainObjectChange.name, () => {
  test('Should be empty', () => {
    const change = new DomainObjectChange();
    expect(change.isEmpty).toBe(true);
    expect(change.isChanged(Changes.renderStyle)).toBe(false);
    expect(change.isFieldNameChanged(Changes.renderStyle, 'radius')).toBe(false);
    expect(change.getChangedDescription(Changes.renderStyle)?.change).toBeUndefined();
    expect(change.getChangedDescriptionByType(ChangedDescription)?.change).toBeUndefined();
  });

  test('should return true on change', () => {
    const change = new DomainObjectChange(Changes.renderStyle, 'radius');

    expect(change.isEmpty).toBe(false);
    expect(change.isChanged(Changes.renderStyle)).toBe(true);
    expect(change.isFieldNameChanged(Changes.renderStyle, 'radius')).toBe(true);
    expect(change.isFieldNameChanged(Changes.renderStyle, 'RADIUS')).toBe(true);
    expect(change.getChangedDescription(Changes.renderStyle)?.change).toBe(Changes.renderStyle);
    expect(change.getChangedDescriptionByType(ChangedDescription)?.change).toBe(
      Changes.renderStyle
    );
  });

  test('should return false on change', () => {
    const change = new DomainObjectChange(Changes.renderStyle, 'radius');
    expect(change.isFieldNameChanged(Changes.renderStyle, 'notExistingField')).toBe(false);
    expect(change.isFieldNameChanged(Changes.color)).toBe(false);
  });

  test('should add DomainObjectChange and addChange', () => {
    const change = new DomainObjectChange();
    change.addChange(Changes.icon);
    change.addChange(Changes.renderStyle, 'radius');
    change.addChange(Changes.color);

    expect(change.isFieldNameChanged(Changes.renderStyle, 'radius')).toBe(true);
    expect(change.isChanged(Changes.icon)).toBe(true);
    expect(change.isChanged(Changes.color)).toBe(true);
    expect(change.isChanged(Changes.selected)).toBe(false);
  });

  test('should add DomainObjectChange and addChangedDescription', () => {
    const description = new ChangedDescription(Changes.renderStyle);
    const change = new DomainObjectChange();
    change.addChangedDescription(description);

    expect(change.isChanged(Changes.renderStyle)).toBe(true);
    expect(change.isChanged(Changes.selected)).toBe(false);
  });
});
