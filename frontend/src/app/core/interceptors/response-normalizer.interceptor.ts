import { HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/**
 * ============================================================================
 *  Response Normalizer Interceptor
 * ============================================================================
 *  Backend hétérogène (Symfony / .NET / Spring Boot) qui retourne parfois :
 *   - 201 Created    sur les POST
 *   - 204 No Content sur les DELETE
 *   - body sans champ `success`
 *
 *  Ce composant front est codé pour interpréter uniquement :
 *   - statut === 200
 *   - body.success === true
 *
 *  Plutôt que de modifier ~15 composants, on normalise globalement les
 *  réponses **de succès (2xx)** ici :
 *   - statut 201 / 204 → réécrits en 200 OK
 *   - body sans `success` → on ajoute `success: true`
 *   - body null / vide → on renvoie { success: true }
 *
 *  Les erreurs (4xx / 5xx) ne sont PAS interceptées : elles continuent
 *  de remonter normalement aux blocs `error:` des subscribers.
 * ============================================================================
 */
export const responseNormalizerInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event: HttpEvent<unknown>) => {
      // Seules les réponses finales nous intéressent (pas les events de progression)
      if (!(event instanceof HttpResponse)) {
        return event;
      }

      // On ne touche qu'aux 2xx (les 4xx/5xx passent par le canal d'erreur)
      const status = event.status;
      const isSuccess = status >= 200 && status < 300;
      if (!isSuccess) {
        return event;
      }

      // Détermine si on doit normaliser le body
      let normalizedBody = event.body;

      // Cas 1 : body absent (typiquement 204 No Content) → on injecte un objet succès
      if (normalizedBody === null || normalizedBody === undefined) {
        normalizedBody = { success: true };
      }
      // Cas 2 : body est un objet sans champ `success` → on l'injecte
      else if (
        typeof normalizedBody === 'object' &&
        !Array.isArray(normalizedBody) &&
        !('success' in (normalizedBody as Record<string, unknown>))
      ) {
        normalizedBody = { success: true, ...(normalizedBody as Record<string, unknown>) };
      }
      // Cas 3 : body est un tableau → on enveloppe sans casser le contrat existant
      // (rare en pratique, mais sécurise les endpoints qui renvoient direct un array)
      else if (Array.isArray(normalizedBody)) {
        normalizedBody = { success: true, data: normalizedBody };
      }
      // Cas 4 : body a déjà un champ `success` → on le laisse intact

      // Réécriture des statuts 201 / 204 → 200 pour les composants legacy
      const needStatusRewrite = status === 201 || status === 204;
      const needBodyRewrite   = normalizedBody !== event.body;

      if (!needStatusRewrite && !needBodyRewrite) {
        return event;   // rien à changer
      }

      return event.clone({
        body: normalizedBody,
        status: needStatusRewrite ? 200 : status,
        statusText: needStatusRewrite ? 'OK' : event.statusText,
      });
    })
  );
};
