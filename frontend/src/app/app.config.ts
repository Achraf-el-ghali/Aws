import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { routes } from './app.routes';
import { AppConfigService } from './core/config/app-config.service';
import { responseNormalizerInterceptor } from './core/interceptors/response-normalizer.interceptor';

/**
 * Charge /assets/config/runtime-config.json AVANT le démarrage de l'app.
 * Permet de modifier l'URL de l'API sans rebuilder Angular.
 */
function initApp(config: AppConfigService) {
  return () => config.load();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // HTTP client + intercepteurs
    provideHttpClient(
      // 1) Intercepteurs fonctionnels (Angular 15+, nouvelle API)
      withInterceptors([responseNormalizerInterceptor]),
      // 2) Intercepteurs classes via DI (rétro-compatibilité)
      withInterceptorsFromDi(),
    ),

    // Bootstrap config runtime
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [AppConfigService],
      multi: true,
    },
  ],
};
