import { describe, expect, test } from 'vitest';
import { IconFactory } from './IconFactory';
import { SnowIcon } from '@cognite/cogs.js';

describe(IconFactory.name, () => {
  test('should get default icons', () => {
    const Icon = IconFactory.getIcon('NonExistentIcon');

    expect(Icon({})).toStrictEqual(<></>);
  });

  test('should get correct icon', () => {
    const Icon = IconFactory.getIcon('Snow');
    expect(Icon).toBe(SnowIcon);
  });

  test('should install custom icon', () => {
    IconFactory.install('CustomIcon', SnowIcon);
    const Icon = IconFactory.getIcon('CustomIcon');
    expect(Icon).toBe(SnowIcon);
  });
});
