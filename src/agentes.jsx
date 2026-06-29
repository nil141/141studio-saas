// Agentes — placeholder "Próximamente" mientras se construye la feature.

const AgentesPage = ({ navigate }) => {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Agentes</h1>
          <div className="sub">Tu equipo de especialistas de IA</div>
        </div>
      </div>

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "72px 24px", minHeight: 360,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, marginBottom: 22,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--accent-soft)", color: "var(--accent)",
          border: "0.5px solid var(--border)",
        }}>
          <Icon name="sparkles" size={28} strokeWidth={1.6} />
        </div>

        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase",
          color: "var(--accent)", background: "var(--accent-soft)",
          padding: "4px 11px", borderRadius: 99, marginBottom: 16,
        }}>Próximamente</span>

        <div style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.6px", marginBottom: 10 }}>
          Agentes inteligentes
        </div>

        <div style={{
          fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, letterSpacing: "-0.2px",
          maxWidth: 460,
        }}>
          Estamos preparando tu equipo de agentes especializados para automatizar
          tareas creativas y operativas de la agencia. Muy pronto disponible.
        </div>
      </div>
    </div>
  );
};

window.AgentesPage = AgentesPage;
