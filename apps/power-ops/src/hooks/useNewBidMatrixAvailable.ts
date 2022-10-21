import { EventStreamContext } from 'providers/eventStreamProvider';
import { useContext, useEffect } from 'react';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { CogniteEvent } from '@cognite/sdk';
import { EVENT_TYPES } from '@cognite/power-ops-api-types';
import { isNewBidMatrixAvailable } from 'components/ShopQualityAssuranceModal/utils';

export const useNewBidMatrixAvailable = (
  priceAreaExternalId: string,
  bidProcessExternalId: string
) => {
  const { eventStore, newMatrixAvailable, setNewMatrixAvailable } =
    useContext(EventStreamContext);
  const { client } = useAuthenticatedAuthContext();

  const processEvent = async (event: CogniteEvent): Promise<void> => {
    if (!event.metadata?.event_external_id) return;

    const [currentPriceArea] = await client.events.retrieve([
      { externalId: event.metadata.event_external_id },
    ]);

    if (
      event.type === EVENT_TYPES.PROCESS_FINISHED &&
      priceAreaExternalId === currentPriceArea.metadata?.['bid:price_area']
    ) {
      const status = isNewBidMatrixAvailable(event, bidProcessExternalId);
      setNewMatrixAvailable(status);
    }
  };

  useEffect(() => {
    const subscription = eventStore.subscribe(({ event }) => {
      processEvent(event);
    });

    return () => subscription.unsubscribe();
  }, [processEvent]);

  return newMatrixAvailable;
};
