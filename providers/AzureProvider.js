'use strict'

const { ServiceProvider } = require.main.require('@adonisjs/fold')
const MiddlewareBase = require.main.require('@adonisjs/middleware-base')
const middleware = new MiddlewareBase('handle')
const { Logger, Middleware } = require('../src/Drivers')

class AzureProvider extends ServiceProvider {
  register () {
    this.app.extend('Adonis/Src/Logger', 'azure', () => {
      return new Logger()
    })
    this.app.bind('Adonis/Middleware/AzureApplicationInsights', () => {
      return new Middleware()
    })

    middleware.registerGlobal([
      'Adonis/Middleware/AzureApplicationInsights'
    ])
  }
}

module.exports = AzureProvider