export interface FusionSubappGeneratorSchema {
  name: string;
  routing?: boolean;
  internationalization?: boolean;
  createMockEnvironment?: boolean;
  e2eTestRunner: 'cypress' | 'none';
  tags?: string;
  directory?: string;
}
