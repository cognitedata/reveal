import { render } from '@testing-library/react';
import { composeStories } from '@storybook/testing-react';
import { describeWithConsoleErrorChecks } from '__test_utils__/describeWithConsoleErrorChecks';

import * as stories from '../__stories__/actions.status.stories';

const testCases = Object.values(composeStories(stories)).map((Story) => [
  // The ! is necessary in Typescript only, as the property is part of a partial type
  Story.storyName!,
  Story,
]);

describeWithConsoleErrorChecks('Action Status Stories', 2, () => {
  // Batch snapshot testing
  test.each(testCases)('Renders %s story', async (_storyName, Story) => {
    const { baseElement } = await render(<Story />);
    expect(baseElement).toMatchSnapshot();
  });
});
