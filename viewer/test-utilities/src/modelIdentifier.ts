/*!
 * Copyright 2025 Cognite AS
 */
import { ModelIdentifier } from '../../packages/data-providers';
import { IMock, Mock } from 'moq.ts';

export function createMockModelIdentifier(): IMock<ModelIdentifier> {
  return new Mock<ModelIdentifier>()
    .setup(p => p.revealInternalId)
    .returns(Symbol('test'))
    .setup(p => p.sourceModelIdentifier())
    .returns('test: test model');
}
