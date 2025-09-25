module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
     plugins: [
      'react-native-reanimated/plugin', // if you use Reanimated
      'react-native-worklets/plugin',   // ensure this is here
    ],
  };
};