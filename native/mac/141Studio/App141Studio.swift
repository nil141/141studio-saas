// 141'STUDIO — app nativa de Mac que envuelve app.141agency.com
// El chrome (sidebar, botones) es SwiftUI nativo: en macOS Tahoe (26)
// hereda Liquid Glass oficial automáticamente.
import SwiftUI

@main
struct App141Studio: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .frame(minWidth: 1024, minHeight: 640)
        }
        .windowStyle(.hiddenTitleBar)
        .windowToolbarStyle(.unified(showsTitle: false))
    }
}
