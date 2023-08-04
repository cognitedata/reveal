/* eslint-disable */
const params = new URLSearchParams(location.search);

if (typeof importMapOverrides !== 'undefined') {
  if (params.has('externalOverride') && params.has('overrideUrl')) {
    importMapOverrides?.resetOverrides();
    const overrides = parse(location.search); // { externalOverride: [], overrideUrl: [] }
    overrides.externalOverride.forEach((extOverride, i) => {
      importMapOverrides?.addOverride(extOverride, overrides.overrideUrl[i]);
    });

    params.delete('externalOverride');
    params.delete('overrideUrl');
    window.location.search = params.toString();
  }

  importMapOverrides?.enableUI();
}
