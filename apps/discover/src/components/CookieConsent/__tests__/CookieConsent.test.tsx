import { render, screen, fireEvent } from '@testing-library/react';

import { Base } from '../__stories__/CookieConsent.stories-disabled';
import { CONFIRM_BUTTON_TEXT } from '../CookieConsent';

describe('<CookieConsent />', () => {
  it('Should show button', () => {
    const onAccept = jest.fn();
    render(<Base onAccept={onAccept} />);
    expect(
      screen.getByRole('button', { name: CONFIRM_BUTTON_TEXT })
    ).toBeInTheDocument();
  });

  it('Should handle click', () => {
    const onAccept = jest.fn();
    render(<Base onAccept={onAccept} />);

    fireEvent.click(screen.getByRole('button', { name: CONFIRM_BUTTON_TEXT }));

    expect(onAccept).toBeCalled();
  });
});
