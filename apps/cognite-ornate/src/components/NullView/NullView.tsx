import { Graphic } from '@cognite/cogs.js';

import { InnerWrapper, NullViewWrapper } from './elements';

export type NullViewType = 'files' | 'listItems';

export const NullView = ({ type }: { type?: NullViewType }) => {
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
  const noListItems = (
    <>
      <h2>You have no list items</h2>
      <p>
        <span style={{ width: '50%', display: 'block', margin: '0 auto' }}>
          Click a shape to get started
        </span>
      </p>
    </>
  );
  const renderContent = () => {
    switch (type) {
      case 'listItems':
        return noListItems;
      case 'files':
      default:
        return noFiles;
    }
  };
  return (
    <NullViewWrapper className="null-view">
      <InnerWrapper className="">
        <Graphic type="Search" />
        {renderContent()}
      </InnerWrapper>
    </NullViewWrapper>
  );
};
