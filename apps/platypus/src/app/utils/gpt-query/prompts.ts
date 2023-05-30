export function getRelevantTypesPrompt(types: string) {
  return String.raw`You have the following GraphQL types:
  ${types}
  For each type, there is a query \`list<Type>\` to retrieve the elements, \`aggregate<Type>\` to aggregate and count elements, \`search<Type>\` to search for elements, and \`get<Type>ById\` to retrieve a specific element.
  For each prompt, please give me the answere in the form of a JSON array ONLY, which contains the name of the GraphQL types that are most likely relevant for the prompt.
  
  Ensure the response can be parsed as JSON. No text, description or anything else.
  You should only respond using a JSON format as described below
Response Format:
{
    "relevantTypes": ["type1", "type2"]
}`;
}

export function getGraphQLQueryForFDM(relevantTypes: string) {
  return String.raw`
I have the following GraphQL types:
${relevantTypes}
For each type, there is a query \`list<Type>\` to retrieve the elements, \`aggregate<Type>\` to aggregate and count elements, \`search<Type>\` to search for elements, and \`get<Type>ById\` to retrieve a specific element.

Every type has an additional attribute \`externalId\` which is its unique key.
For each type only these queries exist: Query \`list<Type>\` to retrieve the elements, \`aggregate<Type>\` to aggregate and count elements, \`search<Type>\` to search for elements, and \`get<Type>ById\` to retrieve a specific element.
Every query and subtypes has the attribute \`items\`, in which the response is found.
The signature of listPump looks lie this:
\`\`\`listPump(
  after: String
  filter: _ListPumpFilter
  first: Int
  sort: [_PumpSort!]
): _PumpConnection\`\`\`
Querying a TimeSeries looks like this:
\`\`\`rotation {
  __typename
  externalId
  dataPoints (limit:10){
    timestamp
    value
  }
}\`\`\`
Available filters:
{and: [{...},{...}]},
{or: [{...},{...}]},
{not: {...}},
{eq: ...},
{in: ["..."]},
{isNull: True},
{prefix: "..."},
{lt: ...},
{gt: ...},
{lte: ...},
{gte: ...}
All dates are on the ISO8601 format like 2023-04-26T09:46:06Z.
Any combined query must be wrapped in "and" or "or".

For nested types I need to ensure subtype queries are wrapped in \`items\`. Here is an example of how to list SomeType and its subtype \`errors\`: 
query {
  listWorkOrder(first: 2) {
    items {
      name
      linkedAssets {
        items {
          externalId
          description
        }
      }
    }
  }
}

Here is an example of how to retrieve a type by id:
\`\`\`query {
  getPumpById(instance: {externalId: "NOR12-16PA00", spaceExternalId: "pump_demo"}) {
    items {
      externalId
    }
  }
}\`\`\`
Here is an example for how to filter and aggregate:
\`\`\`query {
  aggregateSomeType(filter: {name: {eq: "Gunnar"}}) {
    items {
      count {
        externalId
      }
    }
  }
}\`\`\`
Here is an example for how to filter with ands (name is Gunnar and age is greater than 7)
\`\`\`query {
  searchAnotherType(filter: {and: [{name: {eq: "Gunnar"}}, {age: {gte: 7}}]}) {
    items {
      count {
        externalId
      }
    }
  }
}\`\`\`
Here is an example for how to filter with ors (name is Gunnar or age is greater than 7)
\`\`\`query {
  listWorkOrder(filter: {and: [{name: {eq: "Gunnar"}}, {age: {gte: 7}}]}) {
    items {
      count {
        externalId
      }
    }
  }
}\`\`\`
Here's an example of how to search for a user:
query {
  searchUser(query: "gunnar") {
    items {
      externalId
      name
      email
    }
  }
}\`\`\`

All GraphQL operations are in singular, not plural. That means listMovie and not listMovies. 
Here is an example query including filters and sorting. Filter and sort should not normally be used. Only include properties specified in the data model type in the query, and always include all properties used in filter or sort.
\`\`\`query {
  listMyType(filter: {and: [{dueDate: {gte: "2023-05-01T00:00:00Z", lt: "2023-05-08T00:00:00Z"}}, {isActive: {eq: true}}]}, sort: {durationHours: DESC}) {
    items {
      externalId
      title
      description
      dueDate
      durationHours
      linkedAssets {
        items {
          externalId
          tag
          description
        }
      }
      workItems {
        items {
          externalId
          title
          description
          method
        }
      }
    }
  }
}\`\`\`

Timestamp right now is ${new Date().toISOString()}.

All queries of 1-to-many connections needs to be 2 levels deep. for example

\`\`\`
type A {
  single: B
  multi: [B]
  pressure: TimeSeries
}

type B{
  name: String
}
\`\`\`
a valid query is:
\`\`\`
{
  listA{
    single{
      __typename
      externalId
      name
    }
    multi {
      items{
        __typename
        externalId
        name
      }
    }
  }
}
\`\`\`
notice that \`A.single\` is 1-to-1, which does not need the nested \`item\`, but the \`A.multi\` is 1-to-many, needing to be wrapped in \`items\`. 
All object types comes with an \`externalId\` field. Thus, for all list and search queries notice how \`externalId\` is always included when fetching a connection, along with \`__typename\`, make sure to also return this for all list or search queries.

Same goes for querying anything \`TimeSeries\` type, make sure \`externalId\` and \`__typename\` field must be requested.


To get data points, you query like this
\`\`\`
{
  listA {
    pressure {
      __typename
      externalId
      dataPoints (limit:10) {
        timestamp
        value
      }
    }
  }
}
\`\`\`

For any user prompt I should generate a valid GraphQl query that follows the schemas defined in the examples with subtypes wrapped in \`items\`. Ensure that the response can be parsed as a GraphQL query. No text, description or anything else, just the GraphQL query (no variables), and no expected replacement string from the user (such as YOUR_EQUIPMENT_ID).
  `;
}
