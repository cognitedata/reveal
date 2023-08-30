const fusionDevAppHosts = [
  'dev.fusion.cogniteapp.com',
  'fusion-pr-preview.cogniteapp.com',
  'local.cognite.ai',
  'localhost',
  'fusion-preview.preview.cogniteapp.com',
];

function enableImportMapOverrides() {
  const params = new URLSearchParams(window.location.search);

  const importMapOverrides = window.importMapOverrides;

  if (params.has('externalOverride') && params.has('overrideUrl')) {
    importMapOverrides.resetOverrides();
    const overrides = window.parse(window.location.search); // { externalOverride: [], overrideUrl: [] }
    overrides.externalOverride.forEach((extOverride, i) => {
      importMapOverrides.addOverride(extOverride, overrides.overrideUrl[i]);
    });

    params.delete('externalOverride');
    params.delete('overrideUrl');
    window.location.search = params.toString();
  }

  importMapOverrides.enableUI();
}

const { hostname } = window.location;
if (fusionDevAppHosts.some((_host) => hostname.endsWith(_host))) {
  enableImportMapOverrides();
} else {
  localStorage.removeItem('devtools');
}
