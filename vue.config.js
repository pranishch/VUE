const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/',
  
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    }
  },

  devServer: {
    proxy: {
      '/datafeed': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    },
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
})