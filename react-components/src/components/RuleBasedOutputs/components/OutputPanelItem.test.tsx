/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { type RuleOutput } from '../types';
import { OutputPanelItem } from './OutputPanelItem';

describe('OutputPanelItem', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render the output panel item with color type', async () => {
    const output: RuleOutput = {
      type: 'color',
      fill: '#ff0000',
      outline: 'transparent',
      label: 'Red',
      externalId: '123'
    };

    const { getByTestId } = render(<OutputPanelItem index={0} output={output} />);

    const bulletColor = getByTestId('rule-based-output-panel-bullet-color');
    const label = getByTestId('rule-based-output-panel-label');

    const color = window.getComputedStyle(bulletColor).getPropertyValue('background');

    expect(color).toBe('#ff0000');
    expect(label.innerHTML).contain('Red');
  });

  it('should render the output panel item with non-color type', () => {
    const output = {
      type: 'size',
      fill: '',
      label: 'Size'
    } as unknown as RuleOutput;

    const { getByTestId } = render(<OutputPanelItem index={0} output={output} />);

    const bulletColor = getByTestId('rule-based-output-panel-bullet-color');
    const label = getByTestId('rule-based-output-panel-label');

    const color = window.getComputedStyle(bulletColor).getPropertyValue('background');

    expect(color).toBe('');
    expect(label.innerHTML).contain('Size');
  });

  it('should render the output panel item with color type and no label', () => {
    const output: RuleOutput = {
      type: 'color',
      fill: '#00ff00'
    } as unknown as RuleOutput;

    const { getByTestId } = render(<OutputPanelItem index={0} output={output} />);

    const bulletColor = getByTestId('rule-based-output-panel-bullet-color');
    const label = getByTestId('rule-based-output-panel-label');

    const color = window.getComputedStyle(bulletColor).getPropertyValue('background');

    expect(color).toBe('#00ff00');
    expect(label.innerHTML).contain('#00ff00');
  });

  it('should render the output panel item with non-color type and no label', () => {
    const output: RuleOutput = {
      type: 'size',
      fill: ''
    } as unknown as RuleOutput;

    const { getByTestId } = render(<OutputPanelItem index={0} output={output} />);

    const bulletColor = getByTestId('rule-based-output-panel-bullet-color');
    const label = getByTestId('rule-based-output-panel-label');

    const color = window.getComputedStyle(bulletColor).getPropertyValue('background');

    expect(color).toBe('');
    expect(label.innerHTML).contain('');
  });
});
