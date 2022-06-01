import { Well } from '@cognite/sdk-wells-v3';

// name: well.externalId
// ? `${well.description || well.name} (${well.externalId})`
// : well.name,

export const getWellName = (well: Well) => well.name;
