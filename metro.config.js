const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),  // Path to transformer for SVG
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),  // Remove 'svg' from asset extensions
    sourceExts: [...sourceExts, 'svg'],  // Add 'svg' to source extensions
  },
};

module.exports = mergeConfig(defaultConfig, config);
