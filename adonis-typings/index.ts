/*
 * adonis-drive-azure-storage
 *
 * (c) Alexander Wennerstrøm <alexanderw0310@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Addons/AzureApplicationInsights' {
  /**
   * Configuration accepted by the gcs driver
   */
  export type AzureApplicationInsightsConfig = {
    key?: string
    endpointUrl?: string
    quickPulseHost?: string
    proxyHttpUrl?: string
    proxyHttpsUrl?: string
    autoDependencyCorrelation?: boolean
    autoCollectRequests?: boolean
    autoCollectPerformance?: boolean
    autoCollectPerformanceExtended?: boolean
    autoCollectExceptions?: boolean
    autoCollectDependencies?: boolean
    autoCollectConsole?: boolean
    useDiskRetryCaching?: boolean
    sendLiveMetrics?: boolean
    sampingPercentage?: number
    maxBatchSize?: number
    maxBatchIntervalMs?: number
    correlationIdRetryIntervalMs?: number
    correlationHeaderExcludedDomains?: string[]
  }

  import * as AzureApplicationInsights from 'applicationinsights'
  export default AzureApplicationInsights
}
