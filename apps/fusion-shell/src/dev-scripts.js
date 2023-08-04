document.addEventListener('DOMContentLoaded', () => {
  const scriptPaths = [
    'assets/dependencies/import-map-overrides@1.14.6/dist/import-map-overrides.js',
    'assets/dependencies/query-string@7.1.1/dist/query-string.js',
    'assets/dependencies/dev-setup.js',
  ];

  for (const path of scriptPaths) {
    const script = document.createElement('script');
    script.src = path;
    document?.body?.appendChild(script);
  }

  const importOverride = document.createElement('import-map-overrides-full');
  importOverride.setAttribute('show-when-local-storage', 'devtools');
  importOverride.setAttribute('dev-libs', true);
  document?.body?.appendChild(importOverride);
});
