/*!
 * Copyright 2025 Cognite AS
 */
import { LocalModelIdentifier } from '../../packages/data-providers';
import { IMock, Mock } from 'moq.ts';

export function createMockLocalModelIdentifier(): IMock<LocalModelIdentifier> {
  return new Mock<LocalModelIdentifier>()
    .setup(p => p.revealInternalId)
    .returns(Symbol('test-modelIdentifier'))
    .setup(p => p.sourceModelIdentifier())
    .returns('test-modelIdentifier');
}
