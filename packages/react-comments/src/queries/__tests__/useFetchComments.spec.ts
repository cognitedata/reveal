import { setupServer } from 'msw/node';
import { MessageType } from '@cognite/cogs.js';
import { renderHook } from '@testing-library/react-hooks';
import { QueryClientWrapper } from '__test_utils__/queryClientWrapper';
import { getMockNetworkUserGet } from '__test_utils__/getMockNetworkUserGet';

import {
  getMockNetworkListComments,
  serviceUrl,
  testProject,
} from '../../__test_utils__/getMockNetworkListComments';
import { useFetchComments } from '../useFetchComments';

const networkMocks = setupServer(
  getMockNetworkUserGet('test-id'),
  getMockNetworkListComments()
);

describe('useFetchComments', () => {
  beforeAll(() => networkMocks.listen());
  afterAll(() => networkMocks.close());

  it('should be ok', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useFetchComments({
          target: { id: 'test', targetType: 'test' },
          serviceUrl: `${serviceUrl}/${testProject}`,
        }),
      {
        wrapper: QueryClientWrapper,
      }
    );

    expect(result.current.data).toEqual(undefined);

    await waitForNextUpdate();

    const firstComment = result.current.data
      ? result.current.data[0]
      : ({} as Partial<MessageType>);
    expect(firstComment.id).toEqual('1');
    expect(firstComment.timestamp).toEqual(1629963552092);
    expect(firstComment.user).toEqual('test-_owner');
    expect(firstComment.text).toMatchInlineSnapshot(`
      <Richtext
        initialValue={
          Array [
            Object {
              "children": Array [
                Object {
                  "text": "first comment",
                },
              ],
              "type": "paragraph",
            },
          ]
        }
        readOnly={true}
      />
    `);

    const secondComment = result.current.data
      ? result.current.data[1]
      : ({} as Partial<MessageType>);
    expect(secondComment.id).toEqual('2');
    expect(secondComment.timestamp).toEqual(1629963552092);
    expect(secondComment.user).toEqual('test-displayName');
    expect(secondComment.text).toMatchInlineSnapshot(`
      <Richtext
        initialValue={
          Array [
            Object {
              "children": Array [
                Object {
                  "text": "second comment",
                },
              ],
              "type": "paragraph",
            },
          ]
        }
        readOnly={true}
      />
    `);
  });
});
