'use strict'

/*
 * adonis-logger-azure-application-insights
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import Config from '@ioc:Adonis/Core/Config'
import { AzureApplicationInsightsConfig } from '@ioc:Adonis/Addons/AzureApplicationInsights'
import * as appInsights from 'applicationinsights'

export default class AzureApplicationInsightsProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true

  public async register(): Promise<void> {
    this.app.container.singleton('Adonis/Addons/AzureApplicationInsights', () => {
      return { ...appInsights }
    })
  }

  public async boot(): Promise<void> {
    const config: typeof Config = this.app.container.use('Adonis/Core/Config')

    const appInsightsConfig: AzureApplicationInsightsConfig = config.get(
      'azure-application-insights'
    )

    appInsightsConfig.key = appInsightsConfig.key || process.env.APPINSIGHTS_INSTRUMENTATIONKEY

    if (!appInsightsConfig.key && !process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
      throw Error('Instrumentation key missing')
    }

    appInsights
      .setup(appInsightsConfig.key)
      .setAutoDependencyCorrelation(appInsightsConfig.autoDependencyCorrelation || true)
      .setAutoCollectRequests(appInsightsConfig.autoCollectRequests || true)
      .setAutoCollectPerformance(
        appInsightsConfig.autoCollectPerformance || true,
        appInsightsConfig.autoCollectPerformanceExtended || true
      )
      .setAutoCollectExceptions(appInsightsConfig.autoCollectExceptions || true)
      .setAutoCollectDependencies(appInsightsConfig.autoCollectDependencies || true)
      .setAutoCollectConsole(appInsightsConfig.autoCollectConsole || true)
      .setUseDiskRetryCaching(appInsightsConfig.useDiskRetryCaching || true)
      .setSendLiveMetrics(appInsightsConfig.sendLiveMetrics || true)
      .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)

    if (appInsightsConfig.quickPulseHost && appInsightsConfig.quickPulseHost !== 'null') {
      appInsights.defaultClient.config.quickPulseHost = appInsightsConfig.quickPulseHost
    }
    if (appInsightsConfig.proxyHttpUrl && appInsightsConfig.quickPulseHost !== 'null') {
      appInsights.defaultClient.config.proxyHttpUrl = appInsightsConfig.proxyHttpUrl
    }
    if (appInsightsConfig.proxyHttpsUrl && appInsightsConfig.quickPulseHost !== 'null') {
      appInsights.defaultClient.config.proxyHttpsUrl = appInsightsConfig.proxyHttpsUrl
    }
    if (appInsightsConfig.endpointUrl && appInsightsConfig.quickPulseHost !== 'null') {
      appInsights.defaultClient.config.endpointUrl = appInsightsConfig.endpointUrl
    }
    appInsights.defaultClient.config.samplingPercentage = appInsightsConfig.sampingPercentage || 100
    appInsights.defaultClient.config.maxBatchSize = appInsightsConfig.maxBatchSize || 250
    appInsights.defaultClient.config.maxBatchIntervalMs =
      appInsightsConfig.maxBatchIntervalMs || 15000
    appInsights.defaultClient.config.correlationIdRetryIntervalMs =
      appInsightsConfig.correlationIdRetryIntervalMs || 30000
    appInsights.defaultClient.config.correlationHeaderExcludedDomains =
      appInsightsConfig.correlationHeaderExcludedDomains || []
    appInsights.defaultClient.commonProperties = {
      environment: process.env.NODE_ENV || 'development',
    }

    console.log(appInsights.defaultClient.config)

    appInsights.start()

    this.app.container.withBindings(
      ['Adonis/Core/HttpContext', 'Adonis/Addons/AzureApplicationInsights'],
      (HttpContext, azureAppInsights) => {
        HttpContext.getter(
          'azureAppInsightsClient',
          function azureAppInsightsClient() {
            return azureAppInsights.defaultClient
          },
          true
        )
      }
    )
  }
}
