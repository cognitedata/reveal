import { GraphQLScalarType, Kind } from 'graphql';

export const longScalar = new GraphQLScalarType({
  name: 'Long',
  description: 'Long custom scalar type',
  serialize(value) {
    return value; // Convert outgoing value for JSON
  },
  parseValue(value) {
    return +value; // Convert incoming value to Long
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return +ast.value; // Convert hard-coded AST string to integer and then to Date
    }
    return null; // Invalid hard-coded value (not an integer)
  },
});
