export const getSchemaApiListQuery = () => {
  return {
    query: `
        query ListAPIs {
          listApis {
            edges {
              node {
                externalId
              }
            }
          }
        }
      `,
  };
};
