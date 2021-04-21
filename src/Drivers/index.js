'use strict'

/**
 * dimer-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Winston = require('winston')
const appInsights = require("applicationinsights");
const { AzureApplicationInsightsLogger } = require('winston-azure-application-insights');
let client = null
/**
 * Reports logs to loggly
 *
 * @class Azure
 */
class Logger {
  setConfig (config) {
    this.config = Object.assign({}, {
      level: 'info',
      json: 'true',
      stripColors: true,
      timestamp: new Date().toLocaleTimeString(),
      key: null
    }, config)

    appInsights.setup(this.config.key)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(true)
      .setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
      .start();
    client = appInsights.defaultClient;

    this.logger = Winston.createLogger({
      transports: [new AzureApplicationInsightsLogger({
        ...this.config,
        insights: appInsights
      })]
    })

    this.logger.setLevels(this.levels)
  }

  /**
   * The levels to be used by winston
   *
   * @method levels
   *
   * @return {Object}
   */
  get levels () {
    return {
      emerg: 0,
      alert: 1,
      crit: 2,
      error: 3,
      warning: 4,
      notice: 5,
      info: 6,
      debug: 7
    }
  }

  /**
   * Returns the current level for the driver
   *
   * @attribute level
   *
   * @return {String}
   */
  get level () {
    return this.logger.transports[this.config.name].level
  }

  /**
   * Update driver log level at runtime
   *
   * @param  {String} level
   *
   * @return {void}
   */
  set level (level) {
    this.logger.transports[this.config.name].level = level
  }

  /**
   * Log message
   *
   * @method log
   *
   * @param  {Number}    level
   * @param  {String}    msg
   * @param  {...Spread} meta
   *
   * @return {void}
   */
  log (level, msg, ...meta) {
    const levelName = findKey(this.levels, (num) => num === level)
    this.logger.log(levelName, msg, ...meta)
  }
}

const findKey = function (object, predicate) {
  for (let key in object) {
    if (predicate(object[key])) {
      return key;
    }
  }
}

class Middleware {
  constructor (Config) {
    this.config = Config
  }

  async handle ({ request, response }, next) {
    await next()
    client.trackNodeHttpRequest({request: request.request, response});
  }
}

module.exports = { Logger, Middleware }