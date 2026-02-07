/*!
 * Copyright 2026 Cognite AS
 */

import { generateClusterStyles } from './htmlClusterStyles';

describe('generateClusterStyles', () => {
  test('generates valid CSS with custom prefix and all required selectors', () => {
    const css = generateClusterStyles('my-prefix');

    expect(css).toContain('.my-prefix-icon');
    expect(css).toContain('.my-prefix-icon::before');
    expect(css).toContain('.my-prefix-icon::after');
    expect(css).toContain('.my-prefix-icon.hovered');
    expect(css).toContain('.my-prefix-count');
    expect(css).toContain('@keyframes my-prefix-fade-in');
    expect(css).toContain('@keyframes my-prefix-fade-out');

    expect(css).toContain('--size:');
    expect(css).toContain('--outer-border:');
    expect(css).toContain('--inner-border:');
    expect(css).toContain('--innermost-border:');
    expect(css).toContain('calc(var(--size)');
  });

  test('uses provided class prefix correctly', () => {
    const css1 = generateClusterStyles('reveal-cluster');
    const css2 = generateClusterStyles('custom-prefix');

    expect(css1).toContain('.reveal-cluster-icon');
    expect(css1).not.toContain('.custom-prefix-icon');

    expect(css2).toContain('.custom-prefix-icon');
    expect(css2).not.toContain('.reveal-cluster-icon');
  });
});
