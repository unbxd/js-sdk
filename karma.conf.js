module.exports = function (config) {
  'use strict';
  config.set({

    basePath: '',

    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-jquery',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-html2js-preprocessor',
      'karma-sinon',
      'karma-fixture',
      'karma-json-fixtures-preprocessor',
      'karma-handlebars-preprocessor',
      'karma-spec-reporter',
    ],

    frameworks: ['mocha', 'chai', 'jquery-1.8.3', 'sinon', 'fixture'],

    jsonFixturesPreprocessor: {
      variableName: '__json__'
    },

    preprocessors: {
      '**/*.html': ['html2js'],
      '**/*.json': ['json_fixtures']
    },

    files: [
      './node_modules/handlebars/dist/handlebars.min.js',
      './index.html',
      './unbxdSearch.js',
      './app.js',
      'mock/*.json',
      'test/navigation/*.spec.js',
      'test/search/*.spec.js',
    ],

    reporters: ['spec'],
    port: 9876,
    colors: true,
    autoWatch: false,
    singleRun: true,

    // level of logging
    logLevel: config.LOG_INFO,

    browsers: ['Chrome', 'ChromeHeadless', 'Firefox']
  });
};
