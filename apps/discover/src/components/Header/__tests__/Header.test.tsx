import { render, screen } from '@testing-library/react';

import Header from '../Header';

describe('header', () => {
  const titleText = 'TITLE_TEXT';
  const descriptionText = 'DESCRIPTION_TEXT';
  const leftText = 'LEFT_TEXT';
  const rightText = 'RIGHT_TEXT';
  const bottomText = 'BOTTOM_TEXT';

  it('should render all components', () => {
    render(
      <Header
        title={titleText}
        description={descriptionText}
        Left={() => <span>{leftText}</span>}
        Right={() => <span>{rightText}</span>}
        Bottom={() => <span>{bottomText}</span>}
      />
    );

    expect(screen.getByText(titleText)).toBeInTheDocument();
    expect(screen.getByText(descriptionText)).toBeInTheDocument();
    expect(screen.getByText(leftText)).toBeInTheDocument();
    expect(screen.getByText(rightText)).toBeInTheDocument();
    expect(screen.getByText(bottomText)).toBeInTheDocument();
  });
});
