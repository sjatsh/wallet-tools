module.exports = {
    webpack: {
        configure: webpackConfig => {
            const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(({constructor}) => constructor && constructor.name === 'ModuleScopePlugin');
            webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
            webpackConfig['resolve'] = {
                ...webpackConfig['resolve'], ...{
                    fallback: {
                        path: require.resolve("path-browserify"),
                        assert: require.resolve('assert'),
                        crypto: require.resolve('crypto-browserify'),
                        http: require.resolve('stream-http'),
                        https: require.resolve('https-browserify'),
                        os: require.resolve('os-browserify/browser'),
                        stream: require.resolve('stream-browserify'),
                    }
                }
            }
            return webpackConfig;
        },
    },
};