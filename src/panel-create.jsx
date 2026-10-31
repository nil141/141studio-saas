// Panel · Ventanas de crear (Figma 176:37 tarea, 176:272 proyecto, 176:524
// cliente, 176:761 evento). Guardan con las mismas funciones que los modales
// anteriores (addTask, addProjectAsync, addClient, addAgendaEvent/createMeet).
// Los campos del diseño que no tienen dónde guardarse (prioridad, etiquetas,
// subtareas, tipo de proyecto, Instagram, invitados, aviso) no se muestran.
(() => {
const { useState, useEffect, useRef } = React;
const PN = window.PN;

const s = (d, w) => PIcon.st(d, w);
PIcon.add({
  "w-task14": [14, s("M6.99984 11.9584C9.73825 11.9584 11.9582 9.73849 11.9582 7.00008C11.9582 4.26167 9.73825 2.04175 6.99984 2.04175C4.26143 2.04175 2.0415 4.26167 2.0415 7.00008C2.0415 9.73849 4.26143 11.9584 6.99984 11.9584Z", 0.991667) + s("M4.9585 7.11676L6.3585 8.51676L9.1585 5.6001", 0.991667)],
  "w-folder14": [14, s("M2.04199 4.37492C2.04199 4.0655 2.16491 3.76875 2.3837 3.54996C2.60249 3.33117 2.89924 3.20825 3.20866 3.20825H5.54199L6.70866 4.66659H10.792C11.1014 4.66659 11.3982 4.7895 11.6169 5.00829C11.8357 5.22709 11.9587 5.52383 11.9587 5.83325V10.4999C11.9587 10.8093 11.8357 11.1061 11.6169 11.3249C11.3982 11.5437 11.1014 11.6666 10.792 11.6666H3.20866C2.89924 11.6666 2.60249 11.5437 2.3837 11.3249C2.16491 11.1061 2.04199 10.8093 2.04199 10.4999V4.37492Z", 0.991667)],
  "w-user14": [14, s("M6.99987 7.17503C8.2241 7.17503 9.21654 6.1826 9.21654 4.95837C9.21654 3.73413 8.2241 2.7417 6.99987 2.7417C5.77564 2.7417 4.7832 3.73413 4.7832 4.95837C4.7832 6.1826 5.77564 7.17503 6.99987 7.17503Z", 0.991667) + s("M2.625 11.9583C3.09167 9.74159 4.84167 8.45825 7 8.45825C9.15833 8.45825 10.9083 9.74159 11.375 11.9583", 0.991667)],
  "w-cal14": [14, s("M10.5003 2.91675H3.50033C2.69491 2.91675 2.04199 3.56967 2.04199 4.37508V10.5001C2.04199 11.3055 2.69491 11.9584 3.50033 11.9584H10.5003C11.3057 11.9584 11.9587 11.3055 11.9587 10.5001V4.37508C11.9587 3.56967 11.3057 2.91675 10.5003 2.91675Z", 0.991667) + s("M2.04199 5.83333H11.9587M4.66699 1.75V4.08333M9.33366 1.75V4.08333", 0.991667)],
  "w-x13": [13, s("M3.25 3.25L9.75 9.75M9.75 3.25L3.25 9.75", 1.08333)],
  "w-box24": [24, s("M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z", 1.6) + s("M4 7.5L12 12M12 12L20 7.5M12 12V21", 1.6)],
  "r-cal15": [15, s("M11.25 3.125H3.75C2.88706 3.125 2.1875 3.82456 2.1875 4.6875V11.25C2.1875 12.1129 2.88706 12.8125 3.75 12.8125H11.25C12.1129 12.8125 12.8125 12.1129 12.8125 11.25V4.6875C12.8125 3.82456 12.1129 3.125 11.25 3.125Z", 1.0625) + s("M2.1875 6.25H12.8125M5 1.875V4.375M10 1.875V4.375", 1.0625)],
  "r-clock13": [13, s("M6.50016 11.1041C9.04297 11.1041 11.1043 9.04273 11.1043 6.49992C11.1043 3.95711 9.04297 1.89575 6.50016 1.89575C3.95735 1.89575 1.896 3.95711 1.896 6.49992C1.896 9.04273 3.95735 11.1041 6.50016 11.1041Z", 0.920833) + s("M6.5 4.0625V6.5L8.125 7.58333", 0.920833)],
  "r-clock14": [14, s("M7.00033 11.9584C9.73874 11.9584 11.9587 9.73849 11.9587 7.00008C11.9587 4.26167 9.73874 2.04175 7.00033 2.04175C4.26191 2.04175 2.04199 4.26167 2.04199 7.00008C2.04199 9.73849 4.26191 11.9584 7.00033 11.9584Z", 0.991667) + s("M7 4.375V7L8.75 8.16667", 0.991667)],
  "r-box15": [15, s("M7.5 1.875L2.5 4.6875V10.3125L7.5 13.125L12.5 10.3125V4.6875L7.5 1.875Z", 1.0625) + s("M2.5 4.6875L7.5 7.5M7.5 7.5L12.5 4.6875M7.5 7.5V13.125", 1.0625)],
  "r-tag15": [15, s("M2.1875 7.8125V2.8125C2.1875 2.64674 2.25335 2.48777 2.37056 2.37056C2.48777 2.25335 2.64674 2.1875 2.8125 2.1875H7.8125L12.8125 7.1875L7.1875 12.8125L2.1875 7.8125Z", 1.0625) + s("M5.3125 6.125C5.76123 6.125 6.125 5.76123 6.125 5.3125C6.125 4.86377 5.76123 4.5 5.3125 4.5C4.86377 4.5 4.5 4.86377 4.5 5.3125C4.5 5.76123 4.86377 6.125 5.3125 6.125Z", 1.0625)],
  "r-arrow13": [13, s("M2.70801 6.5H10.2913M7.04134 9.75L10.2913 6.5L7.04134 3.25", 0.920833)],
  "r-euro15": [15, s("M10.625 4.0625C10.0104 3.67539 9.30321 3.46015 8.57714 3.43919C7.85107 3.41824 7.13266 3.59233 6.49673 3.94335C5.86081 4.29437 5.33063 4.80947 4.96141 5.43501C4.59219 6.06054 4.39744 6.77363 4.39744 7.5C4.39744 8.22637 4.59219 8.93946 4.96141 9.56499C5.33063 10.1905 5.86081 10.7056 6.49673 11.0566C7.13266 11.4077 7.85107 11.5818 8.57714 11.5608C9.30321 11.5399 10.0104 11.3246 10.625 10.9375M2.5 6.5625H8.125M2.5 8.4375H8.125", 1.0625)],
  "r-globe13": [13, s("M6.49967 11.1041C9.04249 11.1041 11.1038 9.04273 11.1038 6.49992C11.1038 3.95711 9.04249 1.89575 6.49967 1.89575C3.95686 1.89575 1.89551 3.95711 1.89551 6.49992C1.89551 9.04273 3.95686 11.1041 6.49967 11.1041Z", 0.920833) + s("M1.89551 6.49992H11.1038M6.49967 1.89575C7.85384 3.24992 7.85384 9.74992 6.49967 11.1041C5.14551 9.74992 5.14551 3.24992 6.49967 1.89575Z", 0.920833)],
  "r-chl13": [13, s("M8.12467 2.70825L4.33301 6.49992L8.12467 10.2916", 0.920833)],
  "r-chr13": [13, s("M4.875 2.70825L8.66667 6.49992L4.875 10.2916", 0.920833)],
  "r-wa13": [13, `<path d="M9.46438 7.79027C9.3035 7.70956 8.51213 7.32065 8.36479 7.26648C8.21692 7.21286 8.10967 7.18631 8.00188 7.34773C7.89517 7.50861 7.58642 7.87098 7.49271 7.97823C7.399 8.08602 7.30475 8.09902 7.14388 8.01886C6.983 7.93761 6.46408 7.76806 5.84929 7.2199C5.371 6.79306 5.04763 6.26602 4.95392 6.10461C4.86021 5.94373 4.94417 5.85652 5.02433 5.77636C5.09692 5.70431 5.18575 5.5884 5.26592 5.49469C5.34662 5.40044 5.37317 5.33327 5.42733 5.22548C5.48096 5.11823 5.45442 5.02452 5.41379 4.94381C5.37317 4.86311 5.05142 4.07065 4.91762 3.74836C4.78654 3.43473 4.65383 3.47752 4.55525 3.47211C4.46154 3.46777 4.35429 3.46669 4.2465 3.46669C4.13925 3.46669 3.96483 3.50677 3.8175 3.66819C3.67017 3.82906 3.25417 4.21852 3.25417 5.01098C3.25417 5.8029 3.83104 6.56827 3.91121 6.67606C3.99192 6.78331 5.04654 8.4094 6.66125 9.10652C7.04529 9.27227 7.34483 9.3714 7.57883 9.44506C7.9645 9.56802 8.3155 9.55069 8.59229 9.50898C8.90158 9.46294 9.54454 9.11952 9.67888 8.74361C9.81321 8.36769 9.81321 8.0454 9.77258 7.97823C9.7325 7.91106 9.62579 7.87098 9.46438 7.79027ZM6.52746 11.8002H6.52529C5.56642 11.8003 4.62517 11.5425 3.80017 11.0538L3.60462 10.9379L1.57825 11.4698L2.11883 9.49381L1.99154 9.29123C1.45553 8.43771 1.17197 7.44994 1.17362 6.44206C1.17417 3.48998 3.57646 1.08823 6.52962 1.08823C7.95963 1.08823 9.30404 1.64615 10.3148 2.65798C10.8135 3.15448 11.2088 3.74496 11.4778 4.39524C11.7467 5.04552 11.8841 5.74269 11.8818 6.4464C11.8802 9.39848 9.47846 11.8002 6.52746 11.8002ZM11.0845 1.88936C10.4877 1.28861 9.77758 0.812271 8.99534 0.487956C8.2131 0.16364 7.37427 -0.00220797 6.52746 2.21962e-05C2.97683 2.21962e-05 0.0870417 2.88981 0.0854167 6.44152C0.0854167 7.57686 0.381708 8.68511 0.945583 9.66173L0.03125 13L3.44646 12.1041C4.3909 12.6186 5.44924 12.8883 6.52475 12.8884H6.52746C10.0775 12.8884 12.9679 9.99865 12.9695 6.4464C12.9721 5.59992 12.8069 4.76133 12.4833 3.97912C12.1598 3.19692 11.6843 2.48664 11.0845 1.88936Z" fill="#25D366"/>`],
  "r-video15": [15, s("M8.125 4.0625H3.4375C2.57456 4.0625 1.875 4.76206 1.875 5.625V9.375C1.875 10.2379 2.57456 10.9375 3.4375 10.9375H8.125C8.98795 10.9375 9.6875 10.2379 9.6875 9.375V5.625C9.6875 4.76206 8.98795 4.0625 8.125 4.0625Z", 1.0625) + s("M9.6875 6.5625L12.8125 4.6875V10.3125L9.6875 8.4375", 1.0625)],
});

const _MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const _MESL = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const _DIAL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const _isMac = /Mac|iPhone|iPad/.test(navigator.platform || "");
const _today = () => (window.Data && window.Data.today ? window.Data.today() : PN.ymd(new Date()));
const _addDays = (ymd, n) => { const d = PN.parseYmd(ymd) || new Date(); d.setDate(d.getDate() + n); return PN.ymd(d); };
const _dayLabel = (ymd) => {
  if (!ymd) return "Sin fecha";
  const n = PN.dayDiff(ymd);
  if (n === 0) return "Hoy";
  if (n === 1) return "Mañana";
  const d = PN.parseYmd(ymd);
  return `${d.getDate()} ${_MES[d.getMonth()]}`;
};
const _eur = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
const _cname = (c) => (c && (c.company || c.name)) || "";
const _mins = (hm) => { const m = String(hm || "").match(/^(\d{1,2}):(\d{2})/); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
const _hm = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");

// Cierra un desplegable al pulsar fuera
const useOutside = (ref, open, close) => {
  useEffect(() => {
    if (!open) return;
    const down = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, [open]);
};

// Chip con desplegable (fecha, cliente, proyecto…)
const PopChip = ({ label, icon, av, on, dash, tone, wide, children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutside(ref, open, () => setOpen(false));
  return (
    <div className="pn-popw" ref={ref}>
      <button type="button" className={"pn-chip2" + (on ? " on" : "") + (dash ? " dash" : "") + (icon || av ? " ic" : "") + (tone ? " " + tone : "")} onClick={() => setOpen(v => !v)}>
        {av ? <span className="av">{av}</span> : icon ? <PIcon name={icon}/> : null}
        <span>{label}</span>
      </button>
      {open && <div className={"pn-menu pn-pop" + (wide ? " wide" : "")}>{children(() => setOpen(false))}</div>}
    </div>
  );
};
const Opt = ({ children, onClick, on }) => (
  <button type="button" className={"pn-menu-item" + (on ? " on" : "")} onClick={onClick}><span className="t-small">{children}</span></button>
);

// Chip editable (texto)
const InChip = ({ value, onChange, placeholder, icon, type, inputMode, suffix }) => (
  <label className={"pn-chip2 in" + (value ? "" : " dash") + (icon ? " ic" : "")}>
    {icon ? <PIcon name={icon}/> : null}
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type || "text"} inputMode={inputMode}
      size={Math.max(4, (value || placeholder || "").length + 1)} spellCheck={false}/>
    {suffix && value ? <span className="sfx">{suffix}</span> : null}
  </label>
);

const Row = ({ icon, label, children }) => (
  <div className="pn-wrow">
    <div className="lb"><PIcon name={icon}/><span>{label}</span></div>
    <div className="vl">{children}</div>
  </div>
);

const Toggle = ({ on, onChange, label, disabled }) => (
  <label className={"pn-wopt" + (disabled ? " off" : "")}>
    <button type="button" className={"pn-toggle sm" + (on ? " on" : "")} role="switch" aria-checked={!!on} disabled={disabled} onClick={() => onChange(!on)}><i/></button>
    <span>{label}</span>
  </label>
);

// Ventana común
const Win = ({ icon, label, width, onClose, onSubmit, can, busy, cta, foot, children }) => {
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); if (can && !busy) onSubmit(); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });
  const ref = useRef(null);
  PN.useSheetSwipe(ref, onClose);
  return (
    <div className="pn-win-bg" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pn-win" ref={ref} style={{ width }} role="dialog" aria-label={label}>
        <div className="pn-bs-grab"/>
        <div className="bar">
          <PIcon name={icon}/><span className="lbl">{label}</span>
          <span style={{ flex: 1 }}/>
          <span className="esc">esc</span>
          <button type="button" className="x" aria-label="Cerrar" onClick={onClose}><PIcon name="w-x13"/></button>
        </div>
        <div className="body pn-bs-scroll">{children}</div>
        <div className="foot">
          {foot}
          <span style={{ flex: 1 }}/>
          <button type="button" className="cancel" onClick={onClose}>Cancelar</button>
          <button type="button" className="go" disabled={!can || busy} onClick={onSubmit}>
            <span>{busy ? "Creando…" : cta}</span><span className="kb">{_isMac ? "⌘↵" : "Ctrl ↵"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Selectores de cliente y proyecto
const ClientPick = ({ D, value, onChange, allowNone }) => {
  const [q, setQ] = useState("");
  const c = (D.CLIENTS || []).find(x => x.id === value);
  const list = (D.CLIENTS || []).filter(x => !q || _cname(x).toLowerCase().includes(q.toLowerCase()) || (x.name || "").toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  return (
    <PopChip label={c ? _cname(c) : "Elegir cliente"} av={c ? PN.initials(_cname(c)) : null} dash={!c} wide>
      {(close) => (
        <>
          <input className="pn-inline" autoFocus placeholder="Buscar cliente…" value={q} onChange={e => setQ(e.target.value)} style={{ marginBottom: 4 }}/>
          {list.map(x => <Opt key={x.id} on={x.id === value} onClick={() => { onChange(x.id); close(); }}>{_cname(x)}</Opt>)}
          {!list.length && <p className="t-caption" style={{ color: "var(--gray-400)", padding: "8px 10px" }}>Sin resultados</p>}
          {allowNone && value && <Opt onClick={() => { onChange(""); close(); }}>Sin cliente</Opt>}
        </>
      )}
    </PopChip>
  );
};
const DatePick = ({ value, onChange, emptyLabel, extra }) => (
  <PopChip label={value ? _dayLabel(value) : (emptyLabel || "Sin fecha")} on={!!value && PN.dayDiff(value) === 0} dash={!value}>
    {(close) => (
      <>
        {[["Hoy", 0], ["Mañana", 1], ["En una semana", 7]].map(([l, n]) => <Opt key={l} onClick={() => { onChange(_addDays(_today(), n)); close(); }}>{l}</Opt>)}
        <input className="pn-inline pn-dateinput" type="date" value={value || ""} onChange={e => { onChange(e.target.value); if (e.target.value) close(); }}/>
        {extra ? extra(close) : null}
      </>
    )}
  </PopChip>
);
const TimePick = ({ value, onChange }) => (
  <PopChip label={value || "Hora"} icon="r-clock13" dash={!value}>
    {(close) => (
      <>
        <input className="pn-inline pn-dateinput" type="time" autoFocus value={value || ""} onChange={e => onChange(e.target.value)} onKeyDown={e => { if (e.key === "Enter") close(); }}/>
        {value && <Opt onClick={() => { onChange(""); close(); }}>Sin hora</Opt>}
      </>
    )}
  </PopChip>
);

// ── Nueva tarea (176:37) ──
const TaskWin = ({ D, params, onClose, toast, session }) => {
  const [title, setTitle] = useState(""), [desc, setDesc] = useState("");
  const [date, setDate] = useState(params.date || _today()), [time, setTime] = useState("");
  const [clientId, setClientId] = useState(params.clientId || ""), [projectId, setProjectId] = useState(params.projectId || "");
  const [again, setAgain] = useState(false);
  const ref = useRef(null);
  const p = (D.PROJECTS || []).find(x => x.id === projectId);
  const projs = (D.PROJECTS || []).filter(x => !clientId || x.clientId === clientId);
  const me = ((session && session.name) || "").trim();
  const submit = () => {
    const t = title.trim(); if (!t) return;
    const deadline = date || null;
    if (projectId) D.addTask({ projectId, title: t, column: "todo", assignee: "", deadline, time: time || null, frequency: "once", notes: desc || null });
    else if (clientId) {
      const c = (D.CLIENTS || []).find(x => x.id === clientId);
      D.addTask({ title: t, column: "todo", assignee: "", clientId, clientName: _cname(c), deadline, time: time || null, frequency: "once", notes: desc || null });
    } else D.addTask({ title: t, column: "todo", assignee: "", deadline, time: time || null, frequency: "once", notes: desc || null });
    toast && toast("Tarea creada", "success");
    if (again) { setTitle(""); setDesc(""); ref.current && ref.current.focus(); } else onClose();
  };
  return (
    <Win icon="w-task14" label="Nueva tarea" width={600} onClose={onClose} onSubmit={submit} can={!!title.trim()} cta="Crear tarea"
      foot={<Toggle on={again} onChange={setAgain} label="Crear otra después"/>}>
      <div className="pn-wtitle">
        <span className="chk"/>
        <div className="tx">
          <input ref={ref} className="h" autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="¿Qué hay que hacer?"/>
          <input className="d" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Añade una descripción"/>
        </div>
      </div>
      <div className="pn-wprops" style={{ marginTop: 22 }}>
        <Row icon="r-cal15" label="Cuándo"><DatePick value={date} onChange={setDate} extra={(close) => date ? <Opt onClick={() => { setDate(""); close(); }}>Sin fecha</Opt> : null}/><TimePick value={time} onChange={setTime}/></Row>
        <Row icon="user15" label="Cliente"><ClientPick D={D} value={clientId} allowNone onChange={(v) => { setClientId(v); if (p && p.clientId !== v) setProjectId(""); }}/></Row>
        <Row icon="r-box15" label="Proyecto">
          <PopChip label={p ? p.name : "Sin proyecto"} dash={!p} wide>
            {(close) => (
              <>
                {projs.slice(0, 10).map(x => <Opt key={x.id} on={x.id === projectId} onClick={() => { setProjectId(x.id); if (x.clientId) setClientId(x.clientId); close(); }}>{x.name}{x.clientName && !clientId ? ` · ${x.clientName}` : ""}</Opt>)}
                {!projs.length && <p className="t-caption" style={{ color: "var(--gray-400)", padding: "8px 10px" }}>{clientId ? "Este cliente no tiene proyectos" : "No hay proyectos"}</p>}
                {projectId && <Opt onClick={() => { setProjectId(""); close(); }}>Sin proyecto</Opt>}
              </>
            )}
          </PopChip>
        </Row>
        <Row icon="user15" label="Responsable"><span className="pn-chip2 ic"><span className="av me">{PN.initials(me) || "·"}</span><span>{me.split(/\s+/)[0] || "Tú"}</span></span></Row>
      </div>
    </Win>
  );
};

// ── Nuevo proyecto (176:272) ──
const PHASES = ["Onboarding y estrategia", "Auditoría y diagnóstico", "Diseño y producción", "Lanzamiento y optimización"];
const ProjectWin = ({ D, params, onClose, toast }) => {
  const [name, setName] = useState(""), [clientId, setClientId] = useState(params.clientId || "");
  const [deadline, setDeadline] = useState(""), [recurring, setRecurring] = useState(false);
  const [amount, setAmount] = useState(""), [plan, setPlan] = useState("5050");
  const [phases, setPhases] = useState(PHASES), [tpl, setTpl] = useState(true);
  const [invite, setInvite] = useState(false), [busy, setBusy] = useState(false);
  const c = (D.CLIENTS || []).find(x => x.id === clientId);
  const plans = D.PAY_PLANS || {};
  const days = deadline ? PN.dayDiff(deadline) : null;
  const span = days == null ? "" : days >= 14 ? `${Math.round(days / 7)} semanas` : days === 1 ? "1 día" : days > 0 ? `${days} días` : "";
  const amt = Number(String(amount).replace(/\./g, "").replace(",", ".")) || 0;
  const can = !!name.trim() && (recurring || !!deadline);
  const submit = async () => {
    if (!can || busy) return;
    setBusy(true);
    const res = await D.addProjectAsync({
      name: name.trim(), clientId: clientId || null, deadline: recurring ? "" : deadline, recurring,
      template: (tpl ? phases : []).join(", ") || "libre", amount: amt, payments: amt > 0 ? D.buildPayments(amt, plan) : [],
    });
    const p = res && res.project;
    setBusy(false);
    if (!p) { toast && toast((res && res.error) || "No se pudo crear el proyecto", "error"); return; }
    toast && toast(`Proyecto "${p.name}" creado`, "success");
    if (invite && clientId && D.createInvite) {
      const r = await D.createInvite({ clientId, service: "" });
      if (r && r.token) {
        const link = `${window.location.origin}/invite/${r.token}`;
        try { await navigator.clipboard.writeText(link); toast && toast("Enlace del portal copiado", "success"); } catch (_) { toast && toast(link, "success"); }
      } else toast && toast((r && r.error) || "No se pudo generar la invitación", "error");
    }
    onClose();
  };
  const togglePhase = (ph) => setPhases(ps => ps.includes(ph) ? ps.filter(x => x !== ph) : PHASES.filter(x => ps.includes(x) || x === ph));
  const shown = PHASES;
  return (
    <Win icon="w-folder14" label="Nuevo proyecto" width={640} onClose={onClose} onSubmit={submit} can={can} busy={busy} cta="Crear proyecto"
      foot={<Toggle on={invite && !!clientId} disabled={!clientId} onChange={setInvite} label="Invitar al cliente al portal"/>}>
      <div className="pn-wtitle cen">
        <span className="pic"><PIcon name="w-box24"/></span>
        <div className="tx g3">
          <input className="h" autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del proyecto"/>
          <p className="d">{c ? `Para ${_cname(c)}` : "Proyecto interno"}</p>
        </div>
      </div>
      <div className="pn-wprops" style={{ marginTop: 22 }}>
        <Row icon="user15" label="Cliente"><ClientPick D={D} value={clientId} allowNone onChange={setClientId}/></Row>
        <Row icon="r-cal15" label="Fechas">
          {recurring ? (
            <PopChip label="Recurrente" on>
              {(close) => <Opt onClick={() => { setRecurring(false); close(); }}>Con fecha de entrega</Opt>}
            </PopChip>
          ) : (
            <>
              <span className="pn-chip2" title="Empieza hoy">{(() => { const t = PN.parseYmd(_today()); return `${t.getDate()} ${_MES[t.getMonth()]}`; })()}</span>
              <span className="pn-arw"><PIcon name="r-arrow13"/></span>
              <DatePick value={deadline} onChange={setDeadline} emptyLabel="Entrega" extra={(close) => <Opt onClick={() => { setRecurring(true); setDeadline(""); close(); }}>Recurrente (sin entrega)</Opt>}/>
              {span && <span className="pn-wnote">{span}</span>}
            </>
          )}
        </Row>
        <Row icon="r-euro15" label="Presupuesto">
          <InChip value={amount} onChange={v => setAmount(v.replace(/[^\d.,]/g, ""))} placeholder="Importe" inputMode="decimal" suffix="€"/>
          {amt > 0 && <span className="pn-wnote">+ IVA</span>}
          {amt > 0 && (
            <PopChip label={(plans[plan] && plans[plan].label) || "Plan de cobro"}>
              {(close) => Object.entries(plans).map(([k, v]) => <Opt key={k} on={k === plan} onClick={() => { setPlan(k); close(); }}>{v.label} · {v.desc}</Opt>)}
            </PopChip>
          )}
        </Row>
      </div>
      <div className="pn-wphh">
        <span className="t1">Fases</span><span className="t2">· {tpl ? "Metodología 141" : "Sin fases"}</span>
        <span style={{ flex: 1 }}/>
        <button type="button" className="t3" onClick={() => setTpl(v => !v)}>{tpl ? "Quitar fases" : "Usar Metodología 141"}</button>
      </div>
      {tpl && (
        <div className="pn-wph">
          {shown.map((ph, i) => {
            const inc = phases.includes(ph);
            const first = inc && phases[0] === ph;
            return (
              <button type="button" key={ph} className={"ph" + (first ? " on" : "") + (inc ? "" : " out")} onClick={() => togglePhase(ph)} title={inc ? "Quitar esta fase" : "Añadir esta fase"}>
                <div className="tp"><span className="n">{i + 1}</span><span style={{ flex: 1 }}/><i/></div>
                <p className="nm">{ph}</p>
              </button>
            );
          })}
        </div>
      )}
    </Win>
  );
};

// ── Nuevo cliente (176:524) ──
const SERVICES = ["Diseño web", "Shopify", "Ads", "Redes"];
const ClientWin = ({ D, onClose, toast, navigate }) => {
  const [company, setCompany] = useState(""), [web, setWeb] = useState(""), [email, setEmail] = useState("");
  const [contact, setContact] = useState(""), [phone, setPhone] = useState(""), [svc, setSvc] = useState([]);
  const [invite, setInvite] = useState(false);
  const name = company.trim() || contact.trim();
  const dom = web.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const sub = [dom, svc.join(" y ").toLowerCase()].filter(Boolean).join(" · ");
  const submit = () => {
    if (!name) return;
    const c = D.addClient({ name: contact.trim() || company.trim(), company: company.trim() || contact.trim(), email: email.trim(), phone: phone.trim(), sector: svc.join(" y ") || "" });
    if (!c) { toast && toast("No se pudo crear el cliente", "error"); return; }
    toast && toast(`${c.company} añadido a clientes`, "success");
    // La web y la invitación necesitan que el cliente ya esté guardado
    if (dom || invite) setTimeout(async () => {
      if (dom) D.updateClient(c.id, { website: web.trim() });
      if (invite && D.createInvite) {
        const r = await D.createInvite({ clientId: c.id, service: c.service || "" });
        if (r && r.token) toast && toast(`Invitación lista: ${window.location.origin}/invite/${r.token}`, "success");
        else toast && toast((r && r.error) || "No se pudo generar la invitación", "error");
      }
    }, 2000);
    onClose();
    navigate && navigate("clientDetail", { clientId: c.id });
  };
  return (
    <Win icon="w-user14" label="Nuevo cliente" width={600} onClose={onClose} onSubmit={submit} can={!!name} cta="Crear cliente"
      foot={<Toggle on={invite} onChange={setInvite} label="Invitar al portal de cliente"/>}>
      <div className="pn-wtitle cen">
        <span className="logo">{PN.initials(name) || "·"}</span>
        <div className="tx g4">
          <input className="h" autoFocus value={company} onChange={e => setCompany(e.target.value)} placeholder="Nombre de la empresa"/>
          <p className="d o"><PIcon name="r-globe13"/><span>{sub || "Añade la web y los servicios"}</span></p>
        </div>
      </div>
      <div className="pn-wprops" style={{ marginTop: 18 }}>
        <Row icon="globe15" label="Web"><InChip value={web} onChange={setWeb} placeholder="tuweb.com"/></Row>
        <Row icon="mail15" label="Email"><InChip value={email} onChange={setEmail} placeholder="hola@empresa.com" type="email"/></Row>
        <Row icon="user15" label="Contacto"><InChip value={contact} onChange={setContact} placeholder="Nombre de la persona"/></Row>
        <Row icon="wa15" label="WhatsApp"><InChip value={phone} onChange={setPhone} placeholder="+34 · añadir número" icon="r-wa13" inputMode="tel"/></Row>
        <Row icon="r-tag15" label="Servicios">
          {SERVICES.map(x => (
            <button type="button" key={x} className={"pn-chip2" + (svc.includes(x) ? " on" : " mute")} onClick={() => setSvc(v => v.includes(x) ? v.filter(y => y !== x) : SERVICES.filter(y => v.includes(y) || y === x))}>{x}</button>
          ))}
        </Row>
      </div>
    </Win>
  );
};

// ── Nuevo evento (176:761) ──
const freeSlots = (D, date) => {
  const busy = (D.AGENDA_EVENTS || []).filter(e => e.date === date && _mins(e.time) != null)
    .map(e => { const a = _mins(e.time); const b = _mins(e.timeEnd) || a + 60; return [a, b]; });
  const now = new Date(); const nowM = PN.dayDiff(date) === 0 ? now.getHours() * 60 + now.getMinutes() : -1;
  const out = [];
  for (let m = 9 * 60; m + 30 <= 19 * 60 && out.length < 3; m += 30) {
    if (m <= nowM) continue;
    if (busy.some(([a, b]) => m < b && m + 30 > a)) continue;
    if (out.length && m - out[out.length - 1] < 60) continue;
    out.push(m);
  }
  return out;
};
const Cal = ({ value, end, onChange }) => {
  const base = PN.parseYmd(value) || new Date();
  const [mon, setMon] = useState(new Date(base.getFullYear(), base.getMonth(), 1));
  const first = new Date(mon.getFullYear(), mon.getMonth(), 1);
  const start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7));
  const last = new Date(mon.getFullYear(), mon.getMonth() + 1, 0);
  const weeks = Math.ceil((((first.getDay() + 6) % 7) + last.getDate()) / 7);
  const today = _today();
  const cells = [];
  for (let i = 0; i < weeks * 7; i++) { const d = new Date(start); d.setDate(start.getDate() + i); cells.push(d); }
  const go = (n) => setMon(new Date(mon.getFullYear(), mon.getMonth() + n, 1));
  return (
    <div className="pn-wcal">
      <div className="mh">
        <span className="ml">{_MESL[mon.getMonth()]} {mon.getFullYear()}</span>
        <span style={{ flex: 1 }}/>
        <button type="button" aria-label="Mes anterior" onClick={() => go(-1)}><PIcon name="r-chl13"/></button>
        <button type="button" aria-label="Mes siguiente" onClick={() => go(1)}><PIcon name="r-chr13"/></button>
      </div>
      <div className="gr">
        {["L", "M", "X", "J", "V", "S", "D"].map(l => <span key={l} className="wd">{l}</span>)}
        {cells.map(d => {
          const y = PN.ymd(d), other = d.getMonth() !== mon.getMonth(), past = y < today;
          const inR = end && y > value && y < end, edge = end && (y === value || y === end);
          return (
            <button type="button" key={y} className={"dd" + (other ? " ot" : past ? " ps" : "") + (y === today ? " td" : "") + (y === value || y === end ? " sel" : "") + (inR ? " rg" : "") + (edge ? (y === value ? " rs" : " re") : "")}
              disabled={past && y !== value} onClick={() => onChange(y)}>{d.getDate()}</button>
          );
        })}
      </div>
    </div>
  );
};
const EventWin = ({ D, params, onClose, toast }) => {
  const [title, setTitle] = useState(""), [desc, setDesc] = useState("");
  const [date, setDate] = useState(params.date && params.date >= _today() ? params.date : _today());
  const slots = freeSlots(D, date);
  const [time, setTime] = useState(null);            // "HH:MM" elegido
  const [custom, setCustom] = useState(false), [cStart, setCStart] = useState(""), [cEnd, setCEnd] = useState("");
  const [gConn, setGConn] = useState(null), [meet, setMeet] = useState(true), [busy, setBusy] = useState(false);
  const [allDay, setAllDay] = useState(false), [dateEnd, setDateEnd] = useState(null), [anchor, setAnchor] = useState(false);
  // Todo el día: el primer toque elige el primer día y el segundo (posterior) el último
  const pick = (y) => {
    setCustom(false);
    if (allDay && anchor && y > date) { setDateEnd(y); setAnchor(false); return; }
    setDate(y); setDateEnd(null); setAnchor(allDay);
  };
  useEffect(() => { let ok = true; (async () => { try { const r = D.googleStatus ? await D.googleStatus() : null; if (ok) setGConn(!!(r && r.connected)); } catch (_) { if (ok) setGConn(false); } })(); return () => { ok = false; }; }, []);
  useEffect(() => { if (!custom) setTime(slots.length ? _hm(slots[0]) : null); }, [date]);
  const start = custom ? cStart : time;
  const end = custom ? cEnd : (time ? _hm(_mins(time) + 30) : "");
  const useMeet = !allDay && meet && gConn;
  const d = PN.parseYmd(date), de = dateEnd ? PN.parseYmd(dateEnd) : null;
  const nDays = de ? Math.round((de - d) / 86400000) + 1 : 1;
  const head = !d ? "" : de
    ? `${d.getDate()} ${_MES[d.getMonth()]} → ${de.getDate()} ${_MES[de.getMonth()]} · ${nDays} días`
    : `${_DIAL[d.getDay()]}, ${d.getDate()} de ${_MESL[d.getMonth()].toLowerCase()}`;
  const submit = async () => {
    const t = title.trim(); if (!t || busy) return;
    let link = null, gcalId = null;
    if (useMeet) {
      setBusy(true);
      const r = await D.createMeet({ title: t, date, time: start || null, timeEnd: end || null, description: desc || null });
      setBusy(false);
      if (r && r.ok && r.meetLink) { link = r.meetLink; gcalId = r.eventId || null; }
      else { toast && toast((r && r.error) || "No se pudo crear el enlace de Meet", "error"); return; }
    }
    await D.addAgendaEvent({ title: t, date, dateEnd: allDay ? dateEnd : null, notes: desc || null,
      time: allDay ? null : (start || null), timeEnd: allDay ? null : (end || null), link, gcalId, type: useMeet ? "meeting" : "custom" });
    if (link) { try { await navigator.clipboard.writeText(link); toast && toast("Evento creado · enlace de Meet copiado", "success"); } catch (_) { toast && toast("Evento creado", "success"); } }
    else toast && toast("Evento creado", "success");
    onClose();
  };
  return (
    <Win icon="w-cal14" label="Nuevo evento" width={720} onClose={onClose} onSubmit={submit} can={!!title.trim() && !!date} busy={busy} cta="Crear evento">
      <input className="pn-wh" autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Nombre del evento"/>
      <input className="pn-wd" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Añade una descripción"/>
      <div className="pn-wcols">
        <Cal value={date} end={allDay ? dateEnd : null} onChange={pick}/>
        <div className="det">
          <div className="dhr">
            <p className="dh">{head}</p>
            <span style={{ flex: 1 }}/>
            <div className="pn-tsel">
              <button type="button" className={!allDay ? "on" : ""} onClick={() => { setAllDay(false); setDateEnd(null); }}>Con hora</button>
              <button type="button" className={allDay ? "on" : ""} onClick={() => { setAllDay(true); setAnchor(false); }}>Todo el día</button>
            </div>
          </div>
          {allDay ? (
            <div className="slots">
              <div className="sl on ad"><PIcon name="r-cal15"/><span>{de ? `Todo el día, ${nDays} días seguidos` : "Todo el día"}</span></div>
              <p className="none">{de ? "Toca otro día del calendario para empezar de nuevo." : anchor ? "Ahora toca el último día si dura varios días." : "Para que dure varios días, toca el primer día y después el último."}</p>
              {de && <button type="button" className="sl other" onClick={() => { setDateEnd(null); setAnchor(false); }}><PIcon name="w-x13"/><span>Solo un día</span></button>}
            </div>
          ) : (
          <div className="slots">
            {slots.map(m => {
              const hm = _hm(m), on = !custom && time === hm;
              return (
                <button type="button" key={hm} className={"sl" + (on ? " on" : "")} onClick={() => { setCustom(false); setTime(hm); }}>
                  <PIcon name="r-clock14"/><span>{hm} – {_hm(m + 30)}</span>
                </button>
              );
            })}
            {!slots.length && !custom && <p className="none">No quedan huecos libres este día.</p>}
            {custom ? (
              <div className="sl on cu">
                <PIcon name="r-clock14"/>
                <input type="time" value={cStart} autoFocus onChange={e => { setCStart(e.target.value); if (!cEnd && _mins(e.target.value) != null) setCEnd(_hm(_mins(e.target.value) + 30)); }}/>
                <span>–</span>
                <input type="time" value={cEnd} onChange={e => setCEnd(e.target.value)}/>
              </div>
            ) : (
              <button type="button" className="sl other" onClick={() => setCustom(true)}><PIcon name="r-clock14"/><span>Otra hora</span></button>
            )}
          </div>
          )}
          {!allDay && <div className="pn-wprops">
            <Row icon="r-video15" label="Videollamada">
              {gConn === false ? (
                <span className="pn-chip2 dash">Google no conectado</span>
              ) : (
                <button type="button" className={"pn-chip2" + (meet ? " on" : " mute")} onClick={() => setMeet(v => !v)} title={meet ? "Quitar la videollamada" : "Añadir Google Meet"}>Google Meet</button>
              )}
              {gConn !== false && <span className="pn-wnote sm">{meet ? "se crea al guardar" : "sin videollamada"}</span>}
            </Row>
          </div>}
        </div>
      </div>
    </Win>
  );
};

const PanelCreateWin = ({ kind, params, onClose, navigate, session }) => {
  const D = window.Data; D.useStore();
  const toast = (typeof useToast === "function") ? useToast() : null;
  const p = params || {};
  if (kind === "newTask") return <TaskWin D={D} params={p} onClose={onClose} toast={toast} session={session}/>;
  if (kind === "newProject") return <ProjectWin D={D} params={p} onClose={onClose} toast={toast}/>;
  if (kind === "newClient") return <ClientWin D={D} params={p} onClose={onClose} toast={toast} navigate={navigate}/>;
  if (kind === "newEvent") return <EventWin D={D} params={p} onClose={onClose} toast={toast}/>;
  return null;
};

window.PanelCreateWin = PanelCreateWin;
})();
