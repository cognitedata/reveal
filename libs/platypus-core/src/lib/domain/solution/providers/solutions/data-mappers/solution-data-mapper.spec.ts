import { SolutionDataMapper } from './solution-data-mapper';

describe('SolutionDataMapperTest', () => {
  const createInstance = () => {
    return new SolutionDataMapper();
  };

  const mockDto = {
    externalId: 'testSolution',
    name: 'Test Solution',
    description: 'Test solution',
    owners: [],
    createdTime: 1635936707155,
    lastUpdatedTime: 1635936707155,
  };

  const mockSolution = {
    createdTime: 1635936707155,
    description: 'Test solution',
    id: 'testSolution',
    name: 'Test Solution',
    owners: [],
    updatedTime: 1635936707155,
    version: '',
  };

  it('should create instance', () => {
    const service = createInstance();
    expect(service).toBeTruthy();
  });

  it('should serialize solution into dto', () => {
    const service = createInstance();
    const response = service.serialize(mockSolution);
    expect(response).toEqual({
      externalId: 'testSolution',
      name: 'testSolution',
      description: 'Test solution',
      createdTime: 1635936707155,
    });
  });

  it('should deserialize response into solution', () => {
    const service = createInstance();
    const response = service.deserialize(mockDto);
    expect(response).toEqual(mockSolution);
  });
});
