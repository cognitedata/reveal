const joinDomainArray = (sections: string[]): string => {
  // ew1 cluster is an empty string so we filter it out
  return sections.filter((key) => !!key).join('.');
};

const ALLOWED_SUBDOMAINS = ['preview', 'staging', 'pr', 'uat'];

export const getNewDomain = (hostname: string, cluster: string) => {
  const sections = hostname.split('.');

  if (hostname === 'localhost') {
    return `${hostname}:${process.env.PORT || window.location.port || 3000}`;
  }

  if (sections.length === 2) {
    // eg: cogniteapp.com
    const [domain, tld] = sections;
    return joinDomainArray([cluster, domain, tld]);
  }

  if (sections.length === 3) {
    // eg: foo.cogniteapp.com
    const [app, domain, tld] = sections;
    if (app === cluster) {
      // if app === cluster, URL is already correct - dont adjust
      return joinDomainArray([cluster, domain, tld]);
    }
    return joinDomainArray([app, cluster, domain, tld]);
  }
  if (sections.length === 4) {
    if (ALLOWED_SUBDOMAINS.includes(sections[1])) {
      // eg: foo.preview.cogniteapp.com
      const [app, type, domain, tld] = sections;
      return joinDomainArray([app, type, cluster, domain, tld]);
    }
    // eg: foo.cluster.cogniteapp.com
    const [app, _cluster, domain, tld] = sections;
    return joinDomainArray([app, cluster, domain, tld]);
  }
  if (sections.length === 5) {
    if (ALLOWED_SUBDOMAINS.includes(sections[1])) {
      // eg: foo.preview.cluster.cogniteapp.com
      const [app, type, _cluster, domain, tld] = sections;
      return joinDomainArray([app, type, cluster, domain, tld]);
    }
    if (sections[2] === 'preview') {
      // eg: pr-1234.foo.preview.cogniteapp.com
      // TODO(INFIELD-1930): legacy PR previews, can be removed once Infield migrates to the new format
      const [prNumber, appName, type, domain, tld] = sections;
      return joinDomainArray([prNumber, appName, type, domain, tld]);
    }
  }
  throw new Error('Domain is not supported');
};
