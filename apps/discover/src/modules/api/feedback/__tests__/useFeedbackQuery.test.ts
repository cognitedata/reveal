import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { QueryClientWrapper } from '__test-utils/queryClientWrapper';
import { discoverAPI } from 'modules/api/service';

import { feedback } from '../service';
import {
  useFeedbackCreateMutate,
  useFeedbackUpdateMutate,
  useFeedbackGetAllQuery,
  useFeedbackGetOneQuery,
} from '../useFeedbackQuery';

const feedbackSpy: { [method: string]: jest.SpyInstance } = {};

const id = '12345';

describe('useFeedbackQuery hooks', () => {
  beforeAll(() =>
    Object.keys(feedback).forEach((method: any) => {
      const spy = jest
        .spyOn(discoverAPI.feedback, method)
        .mockImplementation(() => Promise.resolve(method));
      feedbackSpy[method] = spy;
    })
  );

  const getHookResult = async (hook: any) => {
    const { result, waitForNextUpdate } = renderHook(() => hook(), {
      wrapper: QueryClientWrapper,
    });
    waitForNextUpdate();
    return result.current;
  };

  it('useFeedbackCreateMutate', async () => {
    const { mutateAsync } = await getHookResult(useFeedbackCreateMutate);
    await mutateAsync({ key: 'test' });
    await waitFor(() => expect(feedbackSpy.create).toBeCalledTimes(1));
  });

  it('useFeedbackUpdateMutate', async () => {
    const { mutateAsync } = await getHookResult(useFeedbackUpdateMutate);
    const payload: Record<string, unknown> = { key: 'test' };

    await mutateAsync({ id, payload });
    await waitFor(() => expect(feedbackSpy.update).toBeCalledTimes(1));
  });

  it('useFeedbackGetAllQuery', async () => {
    await getHookResult(useFeedbackGetAllQuery);
    await waitFor(() => expect(feedbackSpy.get).toBeCalledTimes(1));
  });

  it('useFeedbackGetOneQuery', async () => {
    await getHookResult(useFeedbackGetOneQuery);
    await waitFor(() => expect(feedbackSpy.getOne).toBeCalledTimes(1));
  });
});
