const {
  rewireBlockstackBuild,
  rewireBlockstackDevServer
} = require('react-app-rewire-blockstack')

module.exports = {

  webpack: (config, env) => {
    if(env === 'production') {
      config = rewireBlockstackBuild(config)
    }
    return config
  },

  devServer: (configFunction) => {
    return (proxy, allowedHost) => {
      let config = configFunction(proxy, allowedHost)
      config = rewireBlockstackDevServer(config)
      return config
    }
  }

}