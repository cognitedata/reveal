import { test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RevealContainer } from '../src';
import { Mock } from 'moq.ts';
import { type CogniteClient } from '@cognite/sdk';

test('adds 1 + 2 to equal 3', () => {
  const sdkMock = new Mock<CogniteClient>();
  render(<RevealContainer sdk={sdkMock.object()} />);
  screen.debug();
});
