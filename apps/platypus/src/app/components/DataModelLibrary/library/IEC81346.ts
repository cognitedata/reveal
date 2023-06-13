import { DataModelLibraryTemplateItem } from '.';

export const IEC81346: DataModelLibraryTemplateItem = {
  name: 'IEC 81346',
  description:
    'IEC 81346 is an international standard that provides guidelines for the structuring and referencing of technical and engineering information in the form of documents or data. It is titled "Industrial systems, installations and equipment and industrial products - Structuring principles and reference designations."',
  category: 'Power & Utilities',
  versions: [
    {
      dml: `type LocationType {
  name: String!
  locationTypeCode: String!
  description: String
  level2Code: String
  level2Description: String
  level1Code: String
  level1Description: String
  codeLevel: Int
  hasSubCodes: [LocationType]
  examples: String
}

type FunctionType {
  name: String!
  functionTypeCode: String!
  description: String
  level2Code: String
  level2Description: String
  level1Code: String
  level1Description: String
  codeLevel: Int
  hasSubCodes: [FunctionType]
  examples: String
}

type ConstructionDomain {
  name: String!
  domainTypeCode: String!
}

type ConstructionFunctionalSystemType {
  name: String!
  functionalSystemTypeCode: String!
  description: String
  systemKind: String
  systemKindDescription: String
  examples: String
}

type ConstructionTechnicalSystemType {
  name: String!
  technicalSystemTypeCode: String!
  description: String
  level1Code: String
  level1Description: String
  codeLevel: Int
  hasSubCodes: [ConstructionTechnicalSystemType]
  examples: String
}

type OilandGasSystemType {
  name: String!
  systemTypeCode: String!
  description: String
  examples: String
}

type OilandGasTechnicalSystemType {
  name: String!
  technicalSystemTypeCode: String!
  description: String
  level1Code: String
  level1Description: String
  codeLevel: Int
  hasSubCodes: [OilandGasTechnicalSystemType]
  examples: String
}

type OilandGasConstructionComplexType {
  name: String!
  complexTypeCode: String!
  description: String
  examples: String
}

type OilandGasConstructionEntityType {
  name: String!
  entityTypeCode: String!
  description: String
  level1Code: String
  level1Description: String
  codeLevel: Int
  hasSubCodes: [OilandGasConstructionEntityType]
  examples: String
}
`,
      version: '1',
      date: new Date('2023-06-03'),
    },
  ],
};
