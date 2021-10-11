import React, { Fragment, useMemo } from 'react';

import { Icons } from '@cognite/cogs.js';

import { InfoContainer, InfoKey, InfoMessage, InfoSeparator } from './elements';

export type InfoCode = 'finish' | 'cancel' | 'edit';

interface Props {
  infoCodes: InfoCode[];
}

export const InfoButton: React.FC<Props> = React.memo(({ infoCodes }) => {
  if (!infoCodes.length) {
    return null;
  }

  const messages = useMemo(
    () =>
      [
        {
          code: 'finish',
          element: (
            <>
              Press <InfoKey>Enter</InfoKey> to finish editing{' '}
            </>
          ),
        },
        {
          code: 'cancel',
          element: (
            <>
              Press <InfoKey>Esc</InfoKey> to cancel polygon search
            </>
          ),
        },
        {
          code: 'edit',
          element: 'Click on the polygon to edit it',
        },
      ].filter((message) => infoCodes.includes(message.code as InfoCode)),
    [infoCodes]
  );

  return (
    <InfoContainer data-testid="shortcut-helper">
      <Icons.Info />
      {messages.map((message, index) => (
        <Fragment key={`${message.code}InfoMessage`}>
          {!!index && <InfoSeparator data-testid="info-message-separator" />}
          <InfoMessage data-testid={`${message.code}-info-message`}>
            {message.element}
          </InfoMessage>
        </Fragment>
      ))}
    </InfoContainer>
  );
});

export default InfoButton;
