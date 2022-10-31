module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        // Bumping react-scripts to version 5 and above requires the following fix:
        // https://alchemy.com/blog/how-to-polyfill-node-core-modules-in-webpack-5
        // This is a setup commonly found in other Fusion sub-apps as well.
        "path": require.resolve("path-browserify")
    })
    config.resolve.fallback = fallback;
    // remove source map warning (see : https://github.com/facebook/create-react-app/discussions/11767#discussioncomment-3416044)
    // todo: remove once data-exploration-components is properly updated from this dependency
    config.ignoreWarnings = [
        function ignoreSourcemapsloaderWarnings(warning) {
            return (
                warning.module &&
                warning.module.resource.includes('node_modules') &&
                warning.details &&
                warning.details.includes('source-map-loader')
            );
        },
    ];
    return config;
}
