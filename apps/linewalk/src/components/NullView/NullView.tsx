import { Graphic } from '@cognite/cogs.js';

import { InnerWrapper, NullViewWrapper } from './elements';

export type NullViewType = 'noLineReview';

export const NullView = ({ type }: { type?: NullViewType }) => {
  const noLineReview = (
    <>
      <h2>No LineReview found</h2>
      <p>
        <span style={{ width: '50%', display: 'block', margin: '0 auto' }}>
          This LineReview could not be found.
        </span>
      </p>
    </>
  );

  const renderContent = () => {
    switch (type) {
      case 'noLineReview':
      default:
        return noLineReview;
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
