module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        // Bumping react-scripts to version 5 and above requires the following fix:
        // https://alchemy.com/blog/how-to-polyfill-node-core-modules-in-webpack-5
        // This is a setup commonly found in other Fusion sub-apps as well.
        "path": require.resolve("path-browserify")
    })
    config.resolve.fallback = fallback;
    return config;
}
