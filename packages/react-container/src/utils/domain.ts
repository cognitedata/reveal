export const getNewDomain = (hostname: string, cluster: string) => {
  const sections = hostname.split('.');

  if (hostname === 'localhost') {
    return `${hostname}:${process.env.PORT || window.location.port || 3000}`;
  }

  if (sections.length === 3) {
    // eg: foo.cogniteapp.com
    const [app, domain, tld] = sections;
    return [app, cluster, domain, tld].join('.');
  }
  if (sections.length === 4) {
    if (
      sections[1] === 'preview' ||
      sections[1] === 'staging' ||
      sections[1] === 'pr'
    ) {
      // eg: foo.preview.cogniteapp.com
      const [app, type, domain, tld] = sections;
      return [app, type, cluster, domain, tld].join('.');
    }
    // eg: foo.cluster.cogniteapp.com
    const [app, _cluster, domain, tld] = sections;
    return [app, cluster, domain, tld].join('.');
  }
  if (sections.length === 5) {
    if (
      sections[1] === 'preview' ||
      sections[1] === 'staging' ||
      sections[1] === 'pr'
    ) {
      // eg: foo.preview.cluster.cogniteapp.com
      const [app, type, _cluster, domain, tld] = sections;
      return [app, type, cluster, domain, tld].join('.');
    }
  }
  throw new Error('Domain is not supported');
};
