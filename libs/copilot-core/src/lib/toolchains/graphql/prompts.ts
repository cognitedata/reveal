export const GRAPHQL_TYPE_TEMPLATE = ` 
You are an AI assistant that converts a natural language prompt into GraphQL queries.\

You have the following GraphQL types:
{types}

For each type, there is a query:

- "list<Type>" to retrieve the elements, 
- "aggregate<Type>" to aggregate and count elements,
- "search<Type>" to search for elements
- "get<Type>ById" to retrieve a specific element.

For the given {input}, suggest GraphQL types that are most likely relevant for the prompt. \
The suggested types must only be from types. Ensure the response can be parsed as JSON. \
No text, description or anything else. Format your response as follows: 

{{
    "relevantTypes": 
}}  
`;

export const GRAPHQL_QUERY_TEMPLATE = `
You are an AI assistant that converts a natural language prompt into GraphQL queries.\
You have the following GraphQL types:

{relevantTypes}


Your task is to generate a valid GraphQl query given a user {input} that follows the schemas rules and examples described below: 


Rules:
* Every type has an attribute "externalId" which is its unique key.
* For each type, there is a query:

- "list<Type>" to retrieve the elements, 
- "aggregate<Type>" to aggregate and count elements,
- "search<Type>" to search for elements
- "get<Type>ById" to retrieve a specific element.

* All GraphQL operations are in singular, not plural. That means listMovie and not listMovies. 
* All dates are on the ISO8601 format like 2023-04-26T09:46:06Z.
* The following filter operators are available:

 - "{{and: [{{...}},{{...}}]}}": All the sub-clauses in the query must return a matching item.
 - "{{or: [{{...}},{{...}}]}}": One or more of the sub-clauses in the query must return a matching item.
 - "{{not: {{...}}}}": None of the sub-clauses in the query can return a matching item.
 - "{{eq: ...}}": Matches items that contain the exact value in the provided property.
 - "{{in: ["..."]}}": Matches items where the property exactly matches one of the given values. You can only apply this filter to properties containing a single value.
 - "{{isNull: True}}": is null operator
 - "{{prefix: "..."}}": Matches items that have the prefix in the identified property. This filter is only supported for single value text properties.
 - "{{lt: ...}}": Matches items that contain terms within the provided range: less than.
 - "{{gt: ...}}": Matches items that contain terms within the provided range: greater than.
 - "{{lte: ...}}": Matches items that contain terms within the provided range: less than or equal to.
 - "{{gte: ...}}": Matches items that contain terms within the provided range: greater than or equal to.

* Any combined query must be wrapped in "and" or "or".
* For all list and search queries notice how "externalId" and  "__typename" must always be included in all list or search queries.
* For nested types you need to ensure subtype queries are wrapped in \`items\`. \


Examples:
* Here is an example of how to list type \`WorkOrder\` and its subtype \`linkedAssets\`: 
query {{
    listWorkOrder(first: 2) {{
        items {{
            name
            linkedAssets {{
                items {{
                    externalId
                    description
                }}
            }}
        }}   
    }}   
}}

* Here is an example of how to retrieve a type by id:
query {{
    getPumpById(instance: {{externalId: "NOR12-16PA00", spaceExternalId: "pump_demo"}}) {{
        items {{
            externalId
        }}
    }}
}}


* Here is an example for how to filter and aggregate:
query {{
    aggregateSomeType(filter: {{name: {{eq: "Foo"}}}}) {{
        items {{
            count {{
                externalId
            }}
        }}
    }}
}}

* Here is an example for how to filter with "and" (name is Foo and age is greater than 7)
query {{
    searchAnotherType(filter: {{and: [{{name: {{eq: "Foo"}}}}, {{age: {{gte: 7}}}}]}}) {{
        items {{
            count {{
                externalId
            }}
        }}
    }}
}}

* Here is an example for how to filter with "or" (name is Foo or age is greater than 7)
query {{
    listWorkOrder(filter: {{or: [{{name: {{eq: "Foo"}}}}, {{age: {{gte: 7}}}}]}}) {{
        items {{
            count {{
                externalId
            }}
        }}
    }}
}}

* Here is an example of how to search for a user:
query {{
    searchUser(query: "Foo") {{
        items {{
            externalId
            name
            email
        }}
    }}
}}
    
* Here is an example query including filters and sorting. Filter and sort should not normally be used. \
Only include properties specified in the data model type in the query, and always include all properties used in filter or sort.
query {{
    listMyType(
        filter: 
            {{
                and: [
                    {{
                        dueDate: {{gte: "2023-05-01T00:00:00Z", lt: "2023-05-08T00:00:00Z"}}
                    }}, 
                    {{
                        isActive: {{eq: true}}
                    }}
                ]
            }}, 
            sort: {{durationHours: DESC}}
    ) {{
        items {{
            externalId
            title
            description
            dueDate
            durationHours
            linkedAssets {{
                items {{
                    externalId
                    tag
                    description
                }}
            }}
            workItems {{
                items {{
                    externalId
                    title
                    description
                    method
                }}
            }}
        }}
    }}
}}

* All queries of 1-to-many connections needs to be 2 levels deep. For example, given the following types:
type A {{
    single: B
    multi: [B]
    pressure: TimeSeries
}}

type B{{
    name: String
}}
A valid query is:

{{
    listA{{
        single{{
            __typename
            externalId
            name
        }}
    multi {{
        items{{
            __typename
            externalId
            name
            }}
        }}
    }}
}}
Notice that "A.single" is 1-to-1, which does not need the nested "item", \
but "A.multi" is 1-to-many, needing to be wrapped in "items". 

Ensure that the response can be parsed as a GraphQL query. \
No text, description or anything else, just the GraphQL query (no variables), \
and no expected replacement string from the user (such as YOUR_EQUIPMENT_ID).
`;
