import { Integration } from '../../model/Integration';

const moreThanOneContact = (integration: Integration | null) => {
  return (
    !integration ||
    (integration && integration.contacts && integration.contacts.length <= 1)
  );
};
export const isValidContactListAfterRemove = (
  integration: Integration | null,
  indexToRemove: number
): boolean => {
  if (moreThanOneContact(integration)) {
    return false;
  }
  const remainingContactsWithNotification =
    integration?.contacts.filter(
      ({ sendNotification }, i) =>
        sendNotification === true && i !== indexToRemove
    ) ?? [];
  return remainingContactsWithNotification?.length > 0;
};
