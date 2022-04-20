import {
  screen,
  fireEvent,
  waitForElementToBeRemoved,
} from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';
import { defaultTestUser } from '__test-utils/testdata.utils';
import * as feedbackActions from 'modules/feedback/actions';
// import { initialState as feedbackState } from 'modules/feedback/reducer';

import GeneralFeedback from './GeneralFeedback';

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Admin -> General feedback', () => {
  const page = (viewProps?: any) =>
    testRenderer(GeneralFeedback, undefined, viewProps);

  const defaultTestInit = async () =>
    // keySuffix: string = 'general',
    // extraState?: any
    {
      return { ...page() };
    };

  it(`should render one row with general feedback with status 'new'`, async () => {
    await defaultTestInit();

    const status = await screen.findByText('New!');

    expect(status).toBeInTheDocument();
  });

  it(`should move the feedback to the deleted key when deleting an object.`, async () => {
    await defaultTestInit();

    await screen.findByText('New!');

    const deleteButton = await screen.findByTestId('button-delete');
    fireEvent.click(deleteButton);

    await waitForElementToBeRemoved(() => screen.queryByText('New!'));
    const status = screen.queryByText('New!');

    expect(status).not.toBeInTheDocument();
  });

  it(`should open the feedback details when clicking the row`, async () => {
    await defaultTestInit();

    await screen.findByText('New!');

    const commentElement = await screen.findByText('Lorem ipsum');
    fireEvent.click(commentElement);

    const replyButton = await screen.findByText('Reply to user');

    expect(replyButton).toBeInTheDocument();
  });

  it(`should assign the feedback to me by clicking the assign to me button`, async () => {
    await defaultTestInit();

    await screen.findByText('New!');

    const assignToMeButton = await screen.findByTestId('button-assign-to-me');

    fireEvent.click(assignToMeButton);

    const assignedUser = await screen.findByText(defaultTestUser);

    expect(assignedUser).toBeInTheDocument();
  });

  it(`should dispatch toggleGeneralFeedbackDeleted when clicking 'show deleted'`, async () => {
    await defaultTestInit();
    const toggleGeneralFeedbackDeletedSpy = jest.spyOn(
      feedbackActions,
      'toggleFeedbackDelete'
    );

    await screen.findByText('New!');

    const deleteButton = await screen.findByTestId('button-delete');
    fireEvent.click(deleteButton);
    const showDeletedSWitch = screen.getByText('View deleted files');

    fireEvent.click(showDeletedSWitch);

    expect(toggleGeneralFeedbackDeletedSpy).toBeCalled();
  });

  // -it(`should trigger recoverGeneralFeedback when clicking recover feedback`, async () => {
  //   const recoverGeneralFeedbackSpy = jest
  //     .spyOn(feedbackActions, 'recoverGeneralFeedback')
  //     .mockImplementation(() => noop);

  //   await defaultTestInit('general-deleted', {
  //     feedback: { ...feedbackState, generalFeedbackShowDeleted: true },
  //   });

  //   const recoverButton = await screen.findByTestId('button-recover');

  //     fireEvent.click(recoverButton);

  //   expect(recoverGeneralFeedbackSpy).toBeCalled();
  //   expect(recoverGeneralFeedbackSpy).toBeCalledWith(expect.any(String));
  // });
});
