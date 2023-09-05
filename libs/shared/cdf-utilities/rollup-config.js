const nrwlConfig = require('@nx/react/plugins/bundle-rollup');
const path = require('node:path');
const fs = require('node:fs');

/**
 * NOTE
 * We need this custom plugin, and need it loaded before nx plugins.
 * This is how our Background component works (in login-page).
 */
function jpgResolverPlugin() {
  return {
    name: 'jpg-resolver',
    resolveId(source, importer) {
      if (source.endsWith('.jpg')) {
        return path.resolve(path.dirname(importer), source);
      }
    },
    load(id) {
      if (id.endsWith('.jpg')) {
        const referenceId = this.emitFile({
          type: 'asset',
          name: path.basename(id),
          source: fs.readFileSync(id),
        });
        return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
      }
    },
  };
}

module.exports = (config) => {
  const nxConfig = nrwlConfig(config);
  const output = nxConfig.output;

  if (output.format === 'esm') {
    output.preserveModules = true;
  }

  return {
    ...nxConfig,
    output: [output],
    plugins: [jpgResolverPlugin(), ...nxConfig.plugins],
  };
};
