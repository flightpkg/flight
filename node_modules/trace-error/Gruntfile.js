module.exports = grunt => {
  require('load-grunt-tasks')(grunt);

  const config = {
    babel: {
      dist: {
        files: {
          'dist/Exception.js': 'src/Exception.js',
          'dist/TraceError.js': 'src/TraceError.js'
        }
      }
    }
  };

  grunt.initConfig(config);
  grunt.registerTask('default', ['babel']);
};

