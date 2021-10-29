## Validating environment variables

The configuration for Azure Application Insights relies on certain environment variables and it is usually a good practice to validate the presence of those environment variables.

Open `env.ts` file, copy and paste the following below.

``` ts

  AZURE_APPLICATION_INSIGHTS_KEY: Env.schema.string(),
  AZURE_APPLICATION_INSIGHTS_ENDPOINT_URL: Env.schema.string.optional({format: 'url'}),
  AZURE_APPLICATION_INSIGHTS_QUICK_PULSE_HOST: Env.schema.string.optional({format: 'url'}),
  AZURE_APPLICATION_INSIGHTS_PROXY_HTTP_URL: Env.schema.string.optional({format: 'url'}),
  AZURE_APPLICATION_INSIGHTS_PROXY_HTTPS_URL: Env.schema.string.optional({format: 'url'}),
  AZURE_APPLICATION_INSIGHTS_AUTO_DEPENDENCY_CORRELATION: Env.schema.boolean.optional(),
  AZURE_APPLICATION_INSIGHTS_AUTO_COLLECT_REQUESTS: Env.schema.boolean.optional(),
  AZURE_APPLICATION_INSIGHTS_AUTO_COLLECT_PERFORMANCE: Env.schema.boolean.optional(),
  AZURE_APPLICATION_INSIGHTS_AUTO_COLLECT_PERFORMANCE_EXTENDED: Env.schema.boolean.optional(),
  AZURE_APPLICATION_INSIGHTS_AUTO_COLLECT_EXCEPTIONS: Env.schema.boolean.optional(),
  AZURE_APPLICATION_INSIGHTS_AUTO_COLLECT_DEPENDENCIES: Env.schema.boolean.optional(),
  AZURE_APPLICATION_INSIGHTS_AUTO_COLLECT_CONSOLE: Env.schema.boolean.optional(),
  AZURE_APPLICATION_INSIGHTS_USE_DISK_RETRY_CACHING: Env.schema.boolean.optional(),
  AZURE_APPLICATION_INSIGHTS_SEND_LIVE_METRICS: Env.schema.boolean.optional(),
  AZURE_APPLICATION_INSIGHTS_SAMPLING_PERCENTAGE: Env.schema.number.optional(),
  AZURE_APPLICATION_INSIGHTS_MAX_BATCH_SIZE: Env.schema.number.optional(),
  AZURE_APPLICATION_INSIGHTS_MAX_BATCH_INTERVAL_MS: Env.schema.number.optional(),
  AZURE_APPLICATION_INSIGHTS_CORRELATION_ID_RETRY_INTERVAL_MS: Env.schema.number.optional(),
  AZURE_APPLICATION_INSIGHTS_CORRELATION_HEADER_EXCLUDED_DOMAINS: (key, value: string): string[] | null => {
    if (value) {
      let excludedDomains = value.split(',')
      if (Array.isArray(excludedDomains)) {
        return excludedDomains
      }
    }
    return null
  },
```

## Requirements 📦
```sh
npm install adonis-logger-azure-application-insights --save

node ace configure adonis-logger-azure-application-insights
```

## Define config 💾
Create environment variables to configure the package

| Key                                                              | Type     | Default | Required |
|------------------------------------------------------------------|----------|---------|----------|
| AZURE_APPLICATION_INSIGHTS_KEY                                   | String   |         | Yes      |
| AZURE_APPLICATION_INSIGHTS_ENDPOINT_URL                          | String   |         | No       |
| AZURE_APPLICATION_INSIGHTS_QUICK_PULSE_HOST                      | String   |         | No       |
| AZURE_APPLICATION_INSIGHTS_PROXY_HTTP_URL                        | String   |         | No       |
| AZURE_APPLICATION_INSIGHTS_PROXY_HTTPS_URL                       | String   |         | No       |
| AZURE_APPLICATION_INSIGHTS_AUTO_DEPENDENCY_CORRELATION           | Boolean  | True    | No       |
| AZURE_APPLICATION_INSIGHTS_AUTO_COLLECT_REQUESTS                 | Boolean  | True    | No       |
| AZURE_APPLICATION_INSIGHTS_AUTO_COLLECT_PERFORMANCE              | Boolean  | True    | No       |
| AZURE_APPLICATION_INSIGHTS_AUTO_COLLECT_PERFORMANCE_EXTENDED     | Boolean  | True    | No       |
| AZURE_APPLICATION_INSIGHTS_AUTO_COLLECT_EXCEPTIONS               | Boolean  | True    | No       |
| AZURE_APPLICATION_INSIGHTS_AUTO_COLLECT_DEPENDENCIES             | Boolean  | True    | No       |
| AZURE_APPLICATION_INSIGHTS_AUTO_COLLECT_CONSOLE                  | Boolean  | True    | No       |
| AZURE_APPLICATION_INSIGHTS_USE_DISK_RETRY_CACHING                | Boolean  | True    | No       |
| AZURE_APPLICATION_INSIGHTS_SEND_LIVE_METRICS                     | Boolean  | False   | No       |
| AZURE_APPLICATION_INSIGHTS_SAMPLING_PERCENTAGE                   | Number   | 100     | No       |
| AZURE_APPLICATION_INSIGHTS_MAX_BATCH_SIZE                        | Number   | 250     | No       |
| AZURE_APPLICATION_INSIGHTS_MAX_BATCH_INTERVAL_MS                 | Number   | 15000   | No       |
| AZURE_APPLICATION_INSIGHTS_CORRELATION_ID_RETRY_INTERVAL_MS      | Number   | 30000   | No       |
| AZURE_APPLICATION_INSIGHTS_CORRELATION_HEADER_EXCLUDED_DOMAINS   | Comma seperated String of Domains |       | No       |

## Usage

### Error handler
```ts
import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AzureApplicationInsights from '@ioc:Adonis/Addons/AzureApplicationInsights'

export default class ExceptionHandler extends HttpExceptionHandler {
  protected statusPages = {
    '403': 'errors/unauthorized',
    '404': 'errors/not-found',
    '500..599': 'errors/server-error',
  }

  constructor () {
    super(Logger)
  }

  public async handle (error: any, ctx: HttpContextContract) {
    AzureApplicationInsights.defaultClient.trackException({
      exception: error,
    })

    return super.handle(error, ctx)
  }
}
```

### Log every request
Create middleware file

```sh
node ace make:middleware ApplicationInsights
```

Update `start/kernel.ts` with

```ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AzureApplicationInsights from '@ioc:Adonis/Addons/AzureApplicationInsights'

export default class Insight {
  public async handle ({ request, response }: HttpContextContract, next: () => Promise<void>) {
    AzureApplicationInsights.defaultClient.trackNodeHttpRequest({
      request: request.request,
      response: response.response,
    })

    await next()
  }
}

```

### Log events

Make a new preload file
```sh
node ace make:prldfile events
```

Define an event listener that listens to all events inside `start/events.ts`.

```ts
import Event from '@ioc:Adonis/Core/Event'
import AzureApplicationInsights from '@ioc:Adonis/Addons/AzureApplicationInsights'

Event.onAny((eventName, eventData) => {
  AzureApplicationInsights.defaultClient.trackEvent({
    name: eventName,
    properties: eventData,
  })
})
```