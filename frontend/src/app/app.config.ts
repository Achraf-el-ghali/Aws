import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { AppConfigService } from './core/config/app-config.service';

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
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [AppConfigService],
      multi: true,
    },
  ],
};
