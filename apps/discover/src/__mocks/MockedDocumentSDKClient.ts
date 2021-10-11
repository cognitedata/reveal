export class MockedDocumentSDKClient {
  documents = {
    search: () =>
      Promise.resolve({
        items: [],
      }),
  };
}
