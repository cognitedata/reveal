import { getContent } from './useAICacheEdited';
describe('getContent', () => {
  it('should format the response correctly', () => {
    const response = {
      items: [
        {
          group: null,
          count: {
            workOrderNumber: 1314,
          },
        },
      ],
    };
    const copilotMessage = {
      graphql: {
        query: 'query aggregate',
      },
    };

    const result = getContent(
      (_a, b) => JSON.stringify(b),
      copilotMessage as any,
      response
    );
    expect(result.trim()).toEqual(
      '- {"aggregate":"count","key":"workOrderNumber","value":1314}'
    );
  });

  it('should return an empty string if the response does not have pageInfo or the query does not start with "query aggregate"', () => {
    const response = {
      items: [
        {
          group: {
            programNumber: 'PM-016440',
          },
          count: {
            workOrderNumber: 114,
          },
        },
        {
          group: {
            programNumber: 'PM-016815',
          },
          count: {
            workOrderNumber: 83,
          },
        },
        {
          group: {
            programNumber: 'PM-016450',
          },
          count: {
            workOrderNumber: 79,
          },
        },
        {
          group: {
            programNumber: 'PM-014055',
          },
          count: {
            workOrderNumber: 57,
          },
        },
        {
          group: {
            programNumber: 'PM-016626',
          },
          count: {
            workOrderNumber: 39,
          },
        },
        {
          group: {
            programNumber: 'PM-016456',
          },
          count: {
            workOrderNumber: 35,
          },
        },
        {
          group: {
            programNumber: 'PM-022178',
          },
          count: {
            workOrderNumber: 35,
          },
        },
        {
          group: {
            programNumber: 'PM-016617',
          },
          count: {
            workOrderNumber: 28,
          },
        },
        {
          group: {
            programNumber: 'PM-012508',
          },
          count: {
            workOrderNumber: 27,
          },
        },
        {
          group: {
            programNumber: 'PM-016459',
          },
          count: {
            workOrderNumber: 27,
          },
        },
        {
          group: {
            programNumber: 'PM-016460',
          },
          count: {
            workOrderNumber: 27,
          },
        },
      ],
    };
    const copilotMessage = {
      graphql: {
        query: 'query something else',
      },
    };
    const result = getContent(
      (_a, b) => JSON.stringify(b),
      copilotMessage as any,
      response
    );
    expect(result.replaceAll(' ', ''))
      .toEqual(`{"key":"programNumber","value":"PM-016440"}
-{"aggregate":"count","key":"workOrderNumber","value":114}

{"key":"programNumber","value":"PM-016815"}
-{"aggregate":"count","key":"workOrderNumber","value":83}

{"key":"programNumber","value":"PM-016450"}
-{"aggregate":"count","key":"workOrderNumber","value":79}

{"key":"programNumber","value":"PM-014055"}
-{"aggregate":"count","key":"workOrderNumber","value":57}

{"key":"programNumber","value":"PM-016626"}
-{"aggregate":"count","key":"workOrderNumber","value":39}

{"key":"programNumber","value":"PM-016456"}
-{"aggregate":"count","key":"workOrderNumber","value":35}

{"key":"programNumber","value":"PM-022178"}
-{"aggregate":"count","key":"workOrderNumber","value":35}

{"key":"programNumber","value":"PM-016617"}
-{"aggregate":"count","key":"workOrderNumber","value":28}

{"key":"programNumber","value":"PM-012508"}
-{"aggregate":"count","key":"workOrderNumber","value":27}

{"key":"programNumber","value":"PM-016459"}
-{"aggregate":"count","key":"workOrderNumber","value":27}

{"key":"programNumber","value":"PM-016460"}
-{"aggregate":"count","key":"workOrderNumber","value":27}

`);
  });
});
