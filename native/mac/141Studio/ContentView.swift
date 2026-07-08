// Sidebar nativo (Liquid Glass en macOS 26) + WKWebView con el SaaS.
import SwiftUI

struct NavItem: Identifiable, Hashable {
    let id: String        // ruta de la SPA (window.__navigate)
    let label: String
    let symbol: String    // SF Symbol
}

struct NavSection: Identifiable {
    let id: String
    let title: String?
    let items: [NavItem]
}

let NAV_SECTIONS: [NavSection] = [
    NavSection(id: "trabajo", title: "Trabajo", items: [
        NavItem(id: "dashboard", label: "Inicio",    symbol: "house"),
        NavItem(id: "projects",  label: "Proyectos", symbol: "folder"),
        NavItem(id: "tasks",     label: "Tareas",    symbol: "checklist"),
        NavItem(id: "clients",   label: "Clientes",  symbol: "person.2"),
        NavItem(id: "campaigns", label: "Campañas",  symbol: "megaphone"),
        NavItem(id: "agentes",   label: "Agentes",   symbol: "sparkles"),
    ]),
    NavSection(id: "finanzas", title: "Finanzas", items: [
        NavItem(id: "income",  label: "Facturación", symbol: "chart.line.uptrend.xyaxis"),
        NavItem(id: "billing", label: "Gastos",      symbol: "creditcard"),
    ]),
    NavSection(id: "comunicacion", title: "Comunicación", items: [
        NavItem(id: "mail",   label: "Correo", symbol: "envelope"),
        NavItem(id: "agenda", label: "Agenda", symbol: "calendar"),
    ]),
    NavSection(id: "otros", title: nil, items: [
        NavItem(id: "nora",     label: "Nora IA",       symbol: "wand.and.stars"),
        NavItem(id: "settings", label: "Configuración", symbol: "gearshape"),
    ]),
]

struct ContentView: View {
    @StateObject private var web = WebController()
    @State private var selection: String? = "dashboard"

    var body: some View {
        NavigationSplitView {
            List(selection: $selection) {
                ForEach(NAV_SECTIONS) { section in
                    Section(header: section.title.map { Text($0) }) {
                        ForEach(section.items) { item in
                            Label(item.label, systemImage: item.symbol)
                                .tag(item.id)
                        }
                    }
                }
            }
            .listStyle(.sidebar)
            .navigationSplitViewColumnWidth(min: 190, ideal: 220, max: 280)
            .safeAreaInset(edge: .bottom) {
                quickCreateButton
                    .padding(.horizontal, 14)
                    .padding(.bottom, 12)
            }
        } detail: {
            WebView(controller: web)
                .ignoresSafeArea()
                .toolbar {
                    ToolbarItem(placement: .primaryAction) {
                        Button { web.reload() } label: {
                            Image(systemName: "arrow.clockwise")
                        }
                        .help("Recargar")
                    }
                }
        }
        .onChange(of: selection) { _, newValue in
            if let route = newValue { web.navigate(to: route) }
        }
    }

    // Botón "Nueva tarea" — con Liquid Glass oficial en macOS 26
    @ViewBuilder
    private var quickCreateButton: some View {
        if #available(macOS 26.0, *) {
            Button { web.quickCreate() } label: {
                Label("Nueva tarea", systemImage: "plus")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.glass)
            .controlSize(.large)
        } else {
            Button { web.quickCreate() } label: {
                Label("Nueva tarea", systemImage: "plus")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
        }
    }
}
