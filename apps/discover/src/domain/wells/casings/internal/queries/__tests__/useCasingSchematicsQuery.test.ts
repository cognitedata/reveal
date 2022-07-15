import 'domain/wells/__mocks/setupWellsMockSDK';

import { getMockCasingSchematic } from 'domain/wells/casings/service/__fixtures/getMockCasingSchematic';
import { getMockCasingsListPost } from 'domain/wells/casings/service/__mocks/getMockCasingsListPost';
import { getMockCasingsListPostError } from 'domain/wells/casings/service/__mocks/getMockCasingsListPostError';

import { setupServer } from 'msw/node';

import { renderHookWithStore } from '__test-utils/renderer';

import { getMockCasingSchematicInternal } from '../../__fixtures/getMockCasingSchematicInternal';
import { useCasingSchematicsQuery } from '../useCasingSchematicsQuery';

const mockCasingSchematic = getMockCasingSchematic();
const mockCasingSchematicInternal = getMockCasingSchematicInternal();

const mockServer = setupServer();

const getHookResult = async () => {
  const wellboreIds = [mockCasingSchematic.wellboreMatchingId];

  const { result, waitForNextUpdate } = renderHookWithStore(() =>
    useCasingSchematicsQuery({ wellboreIds })
  );

  await waitForNextUpdate();

  return result.current;
};

describe('useCasingSchematicsQuery', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return normalized casing schematics', async () => {
    mockServer.use(getMockCasingsListPost());

    const { data } = await getHookResult();
    expect(data).toEqual([mockCasingSchematicInternal]);
  });

  it('should return empty array for server error', async () => {
    mockServer.use(getMockCasingsListPostError());

    const { data } = await getHookResult();
    expect(data).toEqual([]);
  });
});
