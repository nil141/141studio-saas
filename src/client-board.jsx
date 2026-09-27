// Tablero por cliente — pizarra libre estilo Miro (notas, texto e imágenes)
const { useState, useEffect, useRef } = React;

const _BOARD_COLORS = ["#fde68a", "#c7d2fe", "#bbf7d0", "#fbcfe8", "#bae6fd", "#fca5a5", "#e5e7eb"];
const _uid16 = () => "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const _maxZ = (items) => items.reduce((m, i) => Math.max(m, i.z || 1), 0);

// Carga y reduce una imagen a un tamaño razonable (evita blobs enormes)
const _fileToImage = (file) => new Promise((res, rej) => {
  const fr = new FileReader();
  fr.onload = () => { const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = fr.result; };
  fr.onerror = rej; fr.readAsDataURL(file);
});
const _downscale = (img, max = 1400, q = 0.82) => {
  let w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
  const scale = Math.min(1, max / Math.max(w, h));
  w = Math.round(w * scale); h = Math.round(h * scale);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  c.getContext("2d").drawImage(img, 0, 0, w, h);
  let src; try { src = c.toDataURL("image/jpeg", q); } catch (_) { src = img.src; }
  return { src, w, h };
};

const ClientBoard = ({ clientId }) => {
  const D = window.Data;
  const [items, setItems] = useState(() => (D.getClientBoard(clientId) || []).map(i => ({ ...i })));
  const [sel, setSel] = useState(null);
  const [addMenu, setAddMenu] = useState(false);
  const boardRef = useRef(null);
  const fileRef = useRef(null);
  const drag = useRef(null);
  const saveT = useRef(null);
  const firstRun = useRef(true);

  // Recarga si cambia de cliente
  useEffect(() => { setItems((D.getClientBoard(clientId) || []).map(i => ({ ...i }))); setSel(null); firstRun.current = true; }, [clientId]);

  // Autoguardado (debounced) — no en el primer render
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    clearTimeout(saveT.current);
    saveT.current = setTimeout(() => { D.saveClientBoard(clientId, items); }, 500);
    return () => clearTimeout(saveT.current);
  }, [items, clientId]);

  const update = (id, patch) => setItems(list => list.map(i => i.id === id ? { ...i, ...patch } : i));
  const remove = (id) => { setItems(list => list.filter(i => i.id !== id)); setSel(null); };
  const bringFront = (id) => setItems(list => { const mz = _maxZ(list) + 1; return list.map(i => i.id === id ? { ...i, z: mz } : i); });

  // Posición donde soltar un elemento nuevo (centro del viewport del tablero)
  const dropPos = () => {
    const b = boardRef.current;
    const off = (items.length % 7) * 28;
    if (!b) return { x: 80 + off, y: 80 + off };
    return { x: Math.round(b.scrollLeft + b.clientWidth / 2 - 110 + off),
             y: Math.round(b.scrollTop + b.clientHeight / 2 - 90 + off) };
  };
  const addNote = () => { const p = dropPos(); const z = _maxZ(items) + 1; const it = { id: _uid16(), type: "note", ...p, w: 210, h: 170, content: "", color: _BOARD_COLORS[Math.floor(Math.random() * 5)], z }; setItems(l => [...l, it]); setSel(it.id); };
  const addText = () => { const p = dropPos(); const z = _maxZ(items) + 1; const it = { id: _uid16(), type: "text", ...p, w: 280, h: 60, content: "Texto", color: "", z }; setItems(l => [...l, it]); setSel(it.id); };
  const addImageUrl = () => {
    const url = prompt("Pega el enlace de la imagen (https://…):");
    if (!url) return;
    const p = dropPos(); const z = _maxZ(items) + 1;
    setItems(l => [...l, { id: _uid16(), type: "image", ...p, w: 260, h: 180, content: url.trim(), z }]);
  };
  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    try {
      const img = await _fileToImage(file);
      const { src, w, h } = _downscale(img);
      const dispW = 300, dispH = Math.round(dispW * (h / w));
      const p = dropPos(); const z = _maxZ(items) + 1;
      setItems(l => [...l, { id: _uid16(), type: "image", ...p, w: dispW, h: dispH, content: src, z }]);
    } catch (_) { alert("No he podido cargar esa imagen."); }
  };

  // ── Arrastre y redimensionado ──────────────────────────────────────
  const onDragStart = (e, it, mode) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.stopPropagation();
    bringFront(it.id); setSel(it.id);
    const startX = e.clientX, startY = e.clientY;
    drag.current = { id: it.id, mode, startX, startY, x: it.x, y: it.y, w: it.w, h: it.h };
    const move = (ev) => {
      const d = drag.current; if (!d) return;
      const dx = ev.clientX - d.startX, dy = ev.clientY - d.startY;
      if (d.mode === "move") update(d.id, { x: Math.max(0, d.x + dx), y: Math.max(0, d.y + dy) });
      else update(d.id, { w: Math.max(90, d.w + dx), h: Math.max(50, d.h + dy) });
    };
    const up = () => { drag.current = null; window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
  };

  const ordered = items.slice().sort((a, b) => (a.z || 1) - (b.z || 1));

  const toolBtn = { display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: "0 12px", borderRadius: 9,
    background: "var(--bg-elev-2)", color: "var(--text-muted)", border: "0.5px solid var(--border)", cursor: "pointer",
    fontFamily: "inherit", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100dvh - 230px)", minHeight: 420 }}>
      {/* Barra de herramientas */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <button onClick={addNote} style={toolBtn} onMouseEnter={e => e.currentTarget.style.color = "var(--text)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
          <Icon name="plus" size={13}/> Nota
        </button>
        <button onClick={addText} style={toolBtn} onMouseEnter={e => e.currentTarget.style.color = "var(--text)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
          <Icon name="file-text" size={13}/> Texto
        </button>
        <div style={{ position: "relative" }}>
          <button onClick={() => setAddMenu(v => !v)} style={toolBtn} onMouseEnter={e => e.currentTarget.style.color = "var(--text)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
            <Icon name="image" size={13}/> Imagen <Icon name="chevron-down" size={11}/>
          </button>
          {addMenu && (
            <>
              <div onClick={() => setAddMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }}/>
              <div style={{ position: "absolute", top: 40, left: 0, zIndex: 41, minWidth: 190, background: "var(--bg-elev)", border: "0.5px solid var(--border-strong)", borderRadius: 12, boxShadow: "0 12px 32px rgba(0,0,0,0.5)", padding: 6 }}>
                <button onClick={() => { setAddMenu(false); fileRef.current && fileRef.current.click(); }} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "9px 11px", borderRadius: 8, cursor: "pointer", background: "transparent", border: "none", color: "var(--text)", fontFamily: "inherit", fontSize: 13, textAlign: "left" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Icon name="upload" size={14} style={{ color: "var(--text-muted)" }}/> Subir archivo
                </button>
                <button onClick={() => { setAddMenu(false); addImageUrl(); }} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "9px 11px", borderRadius: 8, cursor: "pointer", background: "transparent", border: "none", color: "var(--text)", fontFamily: "inherit", fontSize: 13, textAlign: "left" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Icon name="link" size={14} style={{ color: "var(--text-muted)" }}/> Pegar enlace
                </button>
              </div>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFile}/>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--text-subtle)" }}>Arrastra para mover · esquina para redimensionar</span>
      </div>

      {/* Lienzo */}
      <div ref={boardRef} onMouseDown={() => setSel(null)}
        style={{ flex: 1, minHeight: 0, position: "relative", overflow: "auto", borderRadius: 16,
          border: "0.5px solid var(--border)", background: "var(--bg-elev)",
          backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)", backgroundSize: "22px 22px" }}>
        <div style={{ position: "relative", width: 4000, height: 2600 }}>
          {ordered.map(it => (
            <BoardItem key={it.id} it={it} selected={sel === it.id}
              onDragStart={onDragStart} onUpdate={update} onRemove={remove} onSelect={() => { setSel(it.id); bringFront(it.id); }}/>
          ))}
        </div>
        {items.length === 0 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ textAlign: "center", color: "var(--text-subtle)" }}>
              <Icon name="layers" size={26} style={{ opacity: 0.6 }}/>
              <div style={{ marginTop: 10, fontSize: 13.5 }}>Tablero vacío — añade una nota, texto o imagen arriba.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Un elemento del tablero (nota, texto o imagen)
const BoardItem = ({ it, selected, onDragStart, onUpdate, onRemove, onSelect }) => {
  const [hover, setHover] = useState(false);
  const common = { position: "absolute", left: it.x, top: it.y, width: it.w, height: it.h, zIndex: it.z || 1,
    boxShadow: selected ? "0 0 0 2px var(--accent), 0 10px 30px rgba(0,0,0,0.35)" : "0 4px 14px rgba(0,0,0,0.25)" };
  const del = (
    <button onClick={e => { e.stopPropagation(); onRemove(it.id); }} title="Eliminar"
      style={{ position: "absolute", top: -10, right: -10, width: 22, height: 22, borderRadius: "50%", cursor: "pointer",
        display: (hover || selected) ? "flex" : "none", alignItems: "center", justifyContent: "center",
        background: "var(--bg-elev)", border: "0.5px solid var(--border-strong)", color: "var(--text-muted)", zIndex: 5 }}>
      <Icon name="x" size={12}/>
    </button>
  );
  const resize = (
    <div onMouseDown={e => onDragStart(e, it, "resize")} title="Redimensionar"
      style={{ position: "absolute", right: -3, bottom: -3, width: 16, height: 16, cursor: "nwse-resize",
        display: (hover || selected) ? "block" : "none", borderRight: "2px solid var(--accent)", borderBottom: "2px solid var(--accent)", borderBottomRightRadius: 4 }}/>
  );

  if (it.type === "image") {
    return (
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onMouseDown={e => onDragStart(e, it, "move")}
        style={{ ...common, borderRadius: 10, overflow: "hidden", cursor: "grab", background: "var(--bg-elev-2)", border: "0.5px solid var(--border)" }}>
        <img src={it.content} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", display: "block" }}/>
        {del}{resize}
      </div>
    );
  }
  // note / text
  const isNote = it.type === "note";
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onMouseDown={() => onSelect()}
      style={{ ...common, borderRadius: isNote ? 10 : 8, background: isNote ? it.color : "transparent",
        border: isNote ? "none" : "1px dashed " + (selected ? "var(--accent)" : "transparent"), display: "flex", flexDirection: "column" }}>
      {/* Barra de arrastre */}
      <div onMouseDown={e => onDragStart(e, it, "move")}
        style={{ height: 20, cursor: "grab", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: (hover || selected) ? 1 : 0.35 }}>
        <div style={{ width: 26, height: 3, borderRadius: 2, background: isNote ? "rgba(0,0,0,0.25)" : "var(--text-subtle)" }}/>
      </div>
      {isNote && (hover || selected) && (
        <div style={{ position: "absolute", top: 4, left: 6, display: "flex", gap: 3 }} onMouseDown={e => e.stopPropagation()}>
          {_BOARD_COLORS.slice(0, 6).map(c => (
            <button key={c} onClick={e => { e.stopPropagation(); onUpdate(it.id, { color: c }); }} title="Color"
              style={{ width: 12, height: 12, borderRadius: "50%", background: c, border: it.color === c ? "1.5px solid rgba(0,0,0,0.5)" : "1px solid rgba(0,0,0,0.15)", cursor: "pointer", padding: 0 }}/>
          ))}
        </div>
      )}
      <textarea value={it.content} onChange={e => onUpdate(it.id, { content: e.target.value })}
        onMouseDown={e => e.stopPropagation()} placeholder={isNote ? "Escribe…" : "Texto"}
        style={{ flex: 1, width: "100%", resize: "none", border: "none", outline: "none", background: "transparent",
          padding: isNote ? "2px 12px 12px" : "2px 8px 8px", fontFamily: "inherit",
          fontSize: isNote ? 13.5 : 17, fontWeight: isNote ? 400 : 500, lineHeight: 1.4,
          color: isNote ? "#1a1a1a" : "var(--text)" }}/>
      {del}{resize}
    </div>
  );
};

window.ClientBoard = ClientBoard;
