// WKWebView que carga el SaaS. El user agent lleva "141NativeApp" para que
// la web oculte su sidebar (lo pinta SwiftUI) y exponga window.__navigate.
import SwiftUI
import WebKit

final class WebController: NSObject, ObservableObject {
    let webView: WKWebView

    override init() {
        let config = WKWebViewConfiguration()
        config.defaultWebpagePreferences.allowsContentJavaScript = true
        webView = WKWebView(frame: .zero, configuration: config)
        super.init()
        webView.customUserAgent =
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 "
            + "(KHTML, like Gecko) Version/26.0 Safari/605.1.15 141NativeApp"
        webView.isInspectable = true
        webView.setValue(false, forKey: "drawsBackground")   // el fondo lo pone la ventana
        if let url = URL(string: "https://app.141agency.com") {
            webView.load(URLRequest(url: url))
        }
    }

    /// Navega dentro de la SPA usando el puente window.__navigate
    func navigate(to route: String) {
        js("window.__navigate && window.__navigate('\(route)')")
    }

    func quickCreate() { js("window.__quickCreate && window.__quickCreate()") }
    func reload()      { webView.reload() }

    private func js(_ script: String) {
        webView.evaluateJavaScript(script, completionHandler: nil)
    }
}

struct WebView: NSViewRepresentable {
    @ObservedObject var controller: WebController
    func makeNSView(context: Context) -> WKWebView { controller.webView }
    func updateNSView(_ nsView: WKWebView, context: Context) {}
}
