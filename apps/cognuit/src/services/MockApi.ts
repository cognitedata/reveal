class MockApi {
  public static async getTranslations() {
    const response = await fetch(
      'https://my.api.mockaroo.com/objects?key=e5f987c0',
      {
        method: 'GET',
      }
    );
    return response.json();
  }
}

export default MockApi;

/* MockApi.getTranslations()
    .then((response: DataTransferObject[]) => {
      const responseWithKeyAdded = response.map((translationObject) => {
        return { ...translationObject, key: `key-${translationObject.id}` };
      });
      const allColumnNames = getColumnNames(response);
      const rawColumns = selectColumns(response, allColumnNames);
      dispatch({
        type: Action.SUCCEED,
        payload: {
          data: responseWithKeyAdded,
          rawColumns,
          allColumnNames,
          selectedColumnNames: config.initialSelectedColumnNames,
          columns: selectColumns(
            response,
            config.initialSelectedColumnNames
          ),
        },
      });
    })
    .catch((e: any) => {
      dispatch({ type: Action.FAIL, error: e });
    }); */
