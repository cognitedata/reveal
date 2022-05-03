export const generateConnectionTypes = (typeName: string): string => {
  return `type ${typeName}Connection {
      edges: [${typeName}Edge]!
      items: [${typeName}]!
      pageInfo: PageInfo!
  }
  type ${typeName}Edge {
      node: ${typeName}!
      cursor: String!
  }`;
};
