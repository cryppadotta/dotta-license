module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'DotLicenseCheckout',
      externals: {}
    }
  },
  webpack: {
    define: {
      __VERSION__: JSON.stringify(require('./package.json').version)
    },
    copy: {
      options: {
        debug: true
      },
      patterns: [{ from: 'dot-license.abi.json' }]
    }
  }
};
