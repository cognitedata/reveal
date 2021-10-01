import { Graphic } from '@cognite/cogs.js';

import { InnerWrapper, NullViewWrapper } from './elements';

export const NullView = () => {
  const noFiles = (
    <>
      <h2>You have no files</h2>
      <p>
        <span style={{ width: '50%', display: 'block', margin: '0 auto' }}>
          Make some changes and press the save button to start.
        </span>
      </p>
    </>
  );
  return (
    <NullViewWrapper className="null-view">
      <InnerWrapper className="">
        <Graphic type="Search" />
        {noFiles}
      </InnerWrapper>
    </NullViewWrapper>
  );
};
