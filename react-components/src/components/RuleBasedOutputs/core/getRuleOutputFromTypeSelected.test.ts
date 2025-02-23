/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect } from 'vitest';
import { type ColorRuleOutput, type RuleOutput } from '../types';
import { getRuleOutputFromTypeSelected } from './getRuleOutputFromTypeSelected';

describe('getRuleOutputFromTypeSelected', () => {
  const outputs: RuleOutput[] = [
    {
      type: 'color',
      externalId: 'output-1',
      fill: '#ff0000',
      outline: '#000000'
    },
    {
      type: 'canvasAnnotation',
      externalId: 'output-2',
      fill: '#00ff00',
      outline: '#000000',
      canvasAnnotationId: 'annotation-1'
    }
  ];

  it('should return the color rule output if the output type is color expected and with the fill color', () => {
    const result = getRuleOutputFromTypeSelected(outputs, 'color');

    const expected: ColorRuleOutput = {
      type: 'color',
      externalId: 'output-1',
      fill: '#ff0000',
      outline: '#000000'
    };

    expect(result).toEqual(expected);
    expect(result?.fill).toEqual('#ff0000');
  });

  it('should return undefined if the output type is not color', () => {
    const result = getRuleOutputFromTypeSelected(outputs, 'size');

    expect(result).toBeUndefined();
  });

  it('should return undefined if no matching output type is found', () => {
    const result = getRuleOutputFromTypeSelected(outputs, 'nonexistent');

    expect(result).toBeUndefined();
  });

  it('should return undefined if outputs array is empty', () => {
    const result = getRuleOutputFromTypeSelected([], 'color');

    expect(result).toBeUndefined();
  });
});
