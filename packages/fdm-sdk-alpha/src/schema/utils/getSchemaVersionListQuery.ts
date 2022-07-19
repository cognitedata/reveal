export const getSchemaVersionListQuery = () => {
  return {
    query: `
      query ListAPIWithVersions {
        listApis {
          items {
            versions {
              version
            }
            name
            externalId
          }
        }
      }
    `,
  };
};
