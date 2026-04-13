const fs = require('fs');
const path = require('path');

/**
 * Helper to recursively finds all unique GLSL `import` dependencies in a file.
 * @param {string} filePath - Absolute path to the file.
 * @param {Set<string>} visited - Set of already visited files.
 * @returns {Set<string>} - Set of all unique dependency file paths.
 * @throws {Error} - If infinite recursion (circular dependency) is detected.
 */
function findAllDependencies(filePath, visited = new Set()) {
  if (visited.has(filePath)) {
    throw new Error(`Circular dependency detected in GLSL imports: ${filePath}`);
  }
  visited.add(filePath);
  const deps = new Set();
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    throw new Error(`Failed to read GLSL file: ${filePath}`);
  }
  const importRegex = /#pragma\s+glslify:\s+import\(['"](.+?)['"]\)/g;
  let match;
  const baseDir = path.dirname(filePath);
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const resolvedPath = path.resolve(baseDir, importPath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`GLSL import file not found: ${resolvedPath} (imported in ${filePath})`);
    }
    if (!deps.has(resolvedPath)) {
      deps.add(resolvedPath);
      // Recursively find dependencies in the imported file
      for (const dep of findAllDependencies(resolvedPath, visited)) {
        deps.add(dep);
      }
    }
  }
  visited.delete(filePath);
  return deps;
}

/**
 * GLSL Loader for Webpack to track #pragma glslify: import dependencies.
 * This allows Webpack to watch dependency files for changes during development.
 *
 * Usage: In webpack.config.js, use this loader before 'glslify-loader':
 * {
 *  test: /\.(glsl|vert|frag)$/,
 *  type: 'asset/source',
 *  use: [
 *    path.resolve(__dirname + '/glsl-import-tracker-loader.js'),
 *    {
 *      loader: 'glslify-loader',
 *      options: {
 *        transform: ['glslify-import']
 *      }
 *    }
 *  ]
 * }
 *
 * @param {string} source - The source code of the GLSL file.
 * @returns {string} - The unchanged source code.
 */
module.exports = function (source) {
  // 'this' is the loader context
  const resourcePath = this.resourcePath;
  let dependencies;
  try {
    dependencies = findAllDependencies(resourcePath);
  } catch (err) {
    this.emitError(err);
    // Optionally, you can throw to fail the build:
    // throw err;
    return source;
  }
  for (const dep of dependencies) {
    this.addDependency(dep);
  }
  // Pass the source unchanged
  return source;
};
