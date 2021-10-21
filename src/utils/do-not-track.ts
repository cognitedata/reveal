/**
 * Hardcoded set of domains / clusters that want to opt out of tracking entirely
 */
const domainsWithDoNotTrack = [
  'statnett.cogniteapp.com',
  'power-no.cogniteapp.com',
  'localhost',
];

export const isDoNotTrackDomain = () => {
  return domainsWithDoNotTrack.some((doNotTrackDomain) =>
    window.location.href.includes(doNotTrackDomain)
  );
};
