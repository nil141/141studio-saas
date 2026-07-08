# 141'STUDIO — app nativa de Mac (Liquid Glass)

App macOS en SwiftUI que envuelve `app.141agency.com` en un WKWebView.
El **sidebar es nativo** (List de SwiftUI): en macOS Tahoe (26) hereda el
**Liquid Glass oficial de Apple** automáticamente, igual que el botón
"Nueva tarea" (`.buttonStyle(.glass)`). La web detecta la app por el user
agent (`141NativeApp`), oculta su sidebar y expone `window.__navigate` para
que el sidebar nativo controle la SPA.

## Requisitos
- macOS Tahoe (26) para ver Liquid Glass (la app también corre en Sonoma+,
  con materiales clásicos).
- Xcode 26 o superior (vale la beta de Xcode 27). Gratis en el App Store o
  developer.apple.com/download.
- **No hace falta pagar los 99 €/año**: para ejecutarla en tu propio Mac
  basta tu Apple ID gratuito (Personal Team). El programa de pago solo es
  necesario para distribuir (App Store / notarizar para terceros).

## Opción A — compilada en la nube (sin Xcode) · recomendada
GitHub compila la app en sus Macs con el workflow `Build Mac app`
(.github/workflows/build-mac-app.yml). Se lanza solo al tocar
`native/mac/**` en main, o a mano:

1. GitHub → repo `nil141/141studio-saas` → pestaña **Actions** →
   **Build Mac app** → *Run workflow* (si no hay ya una ejecución verde).
2. Entra en la ejecución verde → sección **Artifacts** → descarga
   **141Studio-mac** y descomprímelo.
3. Arrastra `141Studio.app` a /Aplicaciones.
4. Primera apertura (va sin notarizar): **clic derecho → Abrir → Abrir**.
   Si macOS se pone pesado: `xattr -dr com.apple.quarantine /Applications/141Studio.app`

## Opción B — compilar en tu Mac con Xcode
1. Instala Xcode y ábrelo una vez (acepta la licencia e instala los
   componentes de macOS que pida).
2. Haz doble clic en `native/mac/141Studio.xcodeproj`.
3. Xcode → Settings… → Accounts → “+” → inicia sesión con tu Apple ID.
4. En el proyecto: target **141Studio** → pestaña **Signing & Capabilities**
   → en *Team* elige tu **Personal Team**.
5. Pulsa **▶ (Cmd+R)**. Se abre la app con el sidebar de vidrio y tu SaaS
   dentro.

Para tenerla como app normal: Product → **Build** y arrastra `141Studio.app`
(clic derecho en Products → Show in Finder) a /Aplicaciones.

## Notas
- El botón ↻ de la toolbar recarga la web.
- Si cambias las rutas del sidebar web, actualiza `NAV_SECTIONS` en
  `ContentView.swift` (usa los mismos ids que `window.__navigate`).
- La parte web de este puente vive en `src/z-app.jsx` (window.__navigate,
  clase `native-app`) y en el CSS de `index.html`.
