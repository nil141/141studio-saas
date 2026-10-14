// Calculadora de facturación — estima el impacto de la conversión y el ticket
// medio en la facturación de una tienda online. Inspirada en la de iUROP,
// adaptada al look del CRM (oscuro + acento morado).
const { useState } = React;

const _ACTUAL = "#d7d7df";          // color del dato "actual" (claro)
const _OBJ    = "var(--accent)";    // color del dato "objetivo" (morado)

const _cNum = (n) => Math.round(n).toLocaleString("es-ES");
const _cEur = (n) => _cNum(n) + " €";
const _cPct = (n) => n.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";

// Slider con track rellenado según el valor
const CalcSlider = ({ label, dot, value, min, max, step, onChange, color, display }) => {
  const pct = max > min ? Math.min(100, Math.max(0, (value - min) / (max - min) * 100)) : 0;
  const fill = color === _OBJ ? "var(--accent)" : color;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--text-muted)", letterSpacing: "-0.2px" }}>
          {dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot === _OBJ ? "var(--accent)" : dot, flexShrink: 0 }}/>}
          {label}
        </span>
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.3px" }}>{display}</span>
      </div>
      <input type="range" className="calc-range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", background: `linear-gradient(to right, ${fill} 0%, ${fill} ${pct}%, rgba(255,255,255,0.12) ${pct}%, rgba(255,255,255,0.12) 100%)` }}/>
    </div>
  );
};

const AgencyCalculator = () => {
  const [sessions, setSessions] = useState(15500);
  const [convA, setConvA]       = useState(0.9);
  const [convO, setConvO]       = useState(1.2);
  const [ticketA, setTicketA]   = useState(175);
  const [ticketO, setTicketO]   = useState(175);

  const revA  = sessions * (convA / 100) * ticketA;
  const revO  = sessions * (convO / 100) * ticketO;
  const diff  = Math.max(0, revO - revA);
  const year  = diff * 12;

  const box = { background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.09)", borderRadius: 20 };

  return (
    <div style={{ position: "relative", minHeight: "100dvh", padding: "0 24px 60px", background: "transparent" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", paddingTop: "8vh" }}>

        {/* Cabecera */}
        <div className="calc-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, marginBottom: 30, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <span style={{ display: "inline-block", fontSize: 11.5, color: "var(--text-muted)", background: "rgba(255,255,255,0.06)",
              border: "0.5px solid rgba(255,255,255,0.1)", borderRadius: 99, padding: "5px 12px", marginBottom: 16, letterSpacing: "0.02em" }}>
              Calculadora
            </span>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 400, letterSpacing: "-0.04em", lineHeight: 1.04, margin: 0, color: "var(--text)" }}>
              ¿Cuándo estás dejando de <span style={{ fontStyle: "italic" }}>ganar</span>?
            </h1>
          </div>
          <p style={{ fontSize: 13.5, color: "var(--text-subtle)", lineHeight: 1.55, maxWidth: 300, margin: 0, textAlign: "right" }}>
            Ajusta los datos de tu Tienda Online y estima el impacto de la conversión y el ticket medio en la facturación.
          </p>
        </div>

        {/* Tarjeta principal */}
        <div className="calc-grid" style={{ display: "grid", gridTemplateColumns: "1.08fr 0.92fr", gap: 18, alignItems: "stretch" }}>

          {/* Sliders */}
          <div style={{ ...box, padding: "26px 26px 30px", display: "flex", flexDirection: "column", gap: 26 }}>
            <CalcSlider label="Sesiones al mes" value={sessions} min={0} max={100000} step={100}
              onChange={setSessions} color={_ACTUAL} display={_cNum(sessions)}/>

            <div style={{ height: "0.5px", background: "rgba(255,255,255,0.07)" }}/>

            <div className="calc-pair" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
              <CalcSlider label="Conversión actual" dot={_ACTUAL} value={convA} min={0} max={5} step={0.1}
                onChange={setConvA} color={_ACTUAL} display={_cPct(convA)}/>
              <CalcSlider label="Conversión objetivo" dot={_OBJ} value={convO} min={0} max={5} step={0.1}
                onChange={setConvO} color={_OBJ} display={_cPct(convO)}/>
            </div>

            <div className="calc-pair" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
              <CalcSlider label="Ticket medio actual" dot={_ACTUAL} value={ticketA} min={0} max={1000} step={5}
                onChange={setTicketA} color={_ACTUAL} display={_cEur(ticketA)}/>
              <CalcSlider label="Ticket medio objetivo" dot={_OBJ} value={ticketO} min={0} max={1000} step={5}
                onChange={setTicketO} color={_OBJ} display={_cEur(ticketO)}/>
            </div>
          </div>

          {/* Resultado */}
          <div style={{ background: "#0a0a0c", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 20,
            padding: "28px 28px 30px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)" }}/>
              Lo que dejas de facturar cada mes
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 58, fontWeight: 400, letterSpacing: "-0.04em",
              lineHeight: 1.05, color: "#fff", margin: "10px 0 6px" }}>
              +{_cEur(diff)}
            </div>
            <div style={{ fontSize: 14, color: "var(--text-subtle)" }}>≈ {_cEur(year)} al año</div>

            <div style={{ height: "0.5px", background: "rgba(255,255,255,0.1)", margin: "26px 0 22px" }}/>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: "auto" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--text-muted)", marginBottom: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: _ACTUAL }}/> Facturación actual
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: "-0.03em", color: "#fff" }}>
                  {_cEur(revA)} <span style={{ fontSize: 12.5, color: "var(--text-subtle)", fontFamily: "var(--font-sans)" }}>/mes</span>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--text-muted)", marginBottom: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }}/> Facturación objetivo
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 26, letterSpacing: "-0.03em", color: "#fff" }}>
                  {_cEur(revO)} <span style={{ fontSize: 12.5, color: "var(--text-subtle)", fontFamily: "var(--font-sans)" }}>/mes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.AgencyCalculator = AgencyCalculator;
