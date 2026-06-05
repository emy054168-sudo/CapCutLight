<<<<<<< HEAD
module.exports = {
  presets: ['module:@react-native/babel-preset'],
=======
const { plugins } = require("pretty-format");

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv',{
      moduleName: '@env',
      path: '.env',
      safe: false,
      allowUndefined: true
    }]
  ]
>>>>>>> 24536d18de09e26c1b6d8c879e60e110813b10e9
};
