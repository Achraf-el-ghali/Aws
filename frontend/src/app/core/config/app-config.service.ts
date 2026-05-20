import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@environments/environment';

/**
 * Configuration runtime de l'application.
 * Chargée au démarrage via APP_INITIALIZER depuis /assets/config/runtime-config.json
 * Si le fichier n'existe pas (dev), on utilise les valeurs d'environment.ts.
 */
export interface AppConfig {
  apiBaseUrl: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private config: AppConfig = {
    apiBaseUrl: environment.apiBaseUrl,
  };

  constructor(private http: HttpClient) {}

  /** Appelé via APP_INITIALIZER au boot de l'app. */
  async load(): Promise<void> {
    try {
      const runtime = await firstValueFrom(
        this.http.get<Partial<AppConfig>>('/assets/config/runtime-config.json')
      );
      this.config = { ...this.config, ...runtime };
    } catch {
      // Pas de fichier → on garde les defaults d'environment.ts
    }
  }

  get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }
}
