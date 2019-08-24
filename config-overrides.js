const {
  rewireBlockstackBuild,
  rewireBlockstackDevServer
} = require('react-app-rewire-blockstack')
const {
  override,
  disableEsLint,
  overrideDevServer,
  watchAll,
  getBabelLoader,
} = require("customize-cra");

module.exports = {

  webpack: override(
    // usual webpack plugin
    disableEsLint()
  ),

  devServer: overrideDevServer(
    // dev server plugin
    watchAll()
  )

}