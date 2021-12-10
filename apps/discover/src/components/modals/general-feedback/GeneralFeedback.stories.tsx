import { useState } from 'react';

import { Button } from '@cognite/cogs.js';

import { GeneralFeedbackModal } from './GeneralFeedback';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Components / Modals / general-feedback',
  component: GeneralFeedbackModal,
  decorators: [
    (storyFn: any) => (
      <div style={{ position: 'relative', height: 200 }}>{storyFn()}</div>
    ),
  ],
  parameters: {
    componentSubtitle: 'NB: This is a redux connected component',
  },
};

export const Basic = () => {
  const [isOpen, setIsOpen] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  // const [hasFailed] = useState(false);

  // const sendGeneralFeedback = () => {
  //   setIsLoading(true);
  //   setTimeout(() => {
  //     setIsLoading(false);
  //   }, 2000);
  // };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} aria-label="Open modal">
        Open modal
      </Button>
      <GeneralFeedbackModal
        visible={isOpen}
        onCancel={() => setIsOpen(false)}
        // sendGeneralFeedback={sendGeneralFeedback}
        // isLoading={isLoading}
        // failed={hasFailed}
      />
    </div>
  );
};
