(() => {
  (() => {
    const { useState, useEffect } = React;
    const PN = window.PN;
    const s = (d, w) => PIcon.st(d, w);
    PIcon.add({
      "pencil12": [12, s("M2 10H4L9.5 4.5L7.5 2.5L2 8V10Z", 1)],
      "logout14": [14, s("M8.75 2.33337H10.7917C11.0237 2.33337 11.2463 2.42556 11.4104 2.58966C11.5745 2.75375 11.6667 2.97631 11.6667 3.20837V10.7917C11.6667 11.0238 11.5745 11.2463 11.4104 11.4104C11.2463 11.5745 11.0237 11.6667 10.7917 11.6667H8.75M5.83333 4.66671L3.5 7.00004L5.83333 9.33337M3.5 7.00004H9.33333", 0.991667)],
      "user15": [15, s("M7.5 7.6875C8.81168 7.6875 9.875 6.62418 9.875 5.3125C9.875 4.00082 8.81168 2.9375 7.5 2.9375C6.18832 2.9375 5.125 4.00082 5.125 5.3125C5.125 6.62418 6.18832 7.6875 7.5 7.6875Z", 1.0625) + s("M2.8125 12.8125C3.3125 10.4375 5.1875 9.0625 7.5 9.0625C9.8125 9.0625 11.6875 10.4375 12.1875 12.8125", 1.0625)],
      "bldg15": [15, s("M2.5 12.8125V3.75L7.5 1.875L12.5 3.75V12.8125M5.625 12.8125V9.6875H9.375V12.8125M5 5.625H5.00625M7.5 5.625H7.50625M10 5.625H10.0063M5 7.8125H5.00625M7.5 7.8125H7.50625M10 7.8125H10.0063", 1.0625)],
      "globe15": [15, s("M7.5 12.8125C10.434 12.8125 12.8125 10.434 12.8125 7.5C12.8125 4.56599 10.434 2.1875 7.5 2.1875C4.56599 2.1875 2.1875 4.56599 2.1875 7.5C2.1875 10.434 4.56599 12.8125 7.5 12.8125Z", 1.0625) + s("M2.1875 7.5H12.8125M7.5 2.1875C9.0625 3.75 9.0625 11.25 7.5 12.8125C5.9375 11.25 5.9375 3.75 7.5 2.1875Z", 1.0625)],
      "bell15": [15, s("M6.25 12.8125C6.25 13.144 6.3817 13.462 6.61612 13.6964C6.85054 13.9308 7.16848 14.0625 7.5 14.0625C7.83152 14.0625 8.14946 13.9308 8.38388 13.6964C8.6183 13.462 8.75 13.144 8.75 12.8125M3.75 10V6.875C3.75 5.88044 4.14509 4.92661 4.84835 4.22335C5.55161 3.52009 6.50544 3.125 7.5 3.125C8.49456 3.125 9.44839 3.52009 10.1517 4.22335C10.8549 4.92661 11.25 5.88044 11.25 6.875V10L12.1875 11.25H2.8125L3.75 10Z", 1.0625)],
      "chev15": [15, s("M4.375 6.25L7.5 9.375L10.625 6.25", 1.0625)],
      "check11": [11, s("M2.521 5.72917L4.35433 7.5625L8.47933 3.4375", 1.1)],
      // Apps (17px; en Integraciones se pintan a 19px y el trazo escala igual que en el Figma)
      "app-mail": [17, s("M12.75 3.54163H4.25C3.07639 3.54163 2.125 4.49302 2.125 5.66663V11.3333C2.125 12.5069 3.07639 13.4583 4.25 13.4583H12.75C13.9236 13.4583 14.875 12.5069 14.875 11.3333V5.66663C14.875 4.49302 13.9236 3.54163 12.75 3.54163Z", 1.34583) + s("M2.8335 4.95837L8.50016 9.20837L14.1668 4.95837", 1.34583)],
      "app-cal": [17, s("M12.7503 3.54163H4.25033C3.27232 3.54163 2.47949 4.33446 2.47949 5.31246V12.75C2.47949 13.728 3.27232 14.5208 4.25033 14.5208H12.7503C13.7283 14.5208 14.5212 13.728 14.5212 12.75V5.31246C14.5212 4.33446 13.7283 3.54163 12.7503 3.54163Z", 1.34583) + s("M2.47949 7.08333H14.5212M5.66699 2.125V4.95833M11.3337 2.125V4.95833", 1.34583)],
      "app-bag": [17, s("M3.5415 5.66663H13.4582L12.7498 14.1666H4.24984L3.5415 5.66663Z", 1.34583) + s("M6.375 5.66663C6.375 5.10304 6.59888 4.56254 6.9974 4.16402C7.39591 3.76551 7.93641 3.54163 8.5 3.54163C9.06358 3.54163 9.60409 3.76551 10.0026 4.16402C10.4011 4.56254 10.625 5.10304 10.625 5.66663", 1.34583)],
      "app-card": [17, s("M13.1042 3.89587H3.89583C2.91783 3.89587 2.125 4.6887 2.125 5.66671V11.3334C2.125 12.3114 2.91783 13.1042 3.89583 13.1042H13.1042C14.0822 13.1042 14.875 12.3114 14.875 11.3334V5.66671C14.875 4.6887 14.0822 3.89587 13.1042 3.89587Z", 1.34583) + s("M2.125 7.08337H14.875", 1.34583)],
      "app-send": [17, s("M14.875 2.125L7.4375 9.5625M7.4375 9.5625L2.125 6.72917L14.875 2.125L10.2708 14.875L7.4375 9.5625Z", 1.34583)],
      "app-folder": [17, s("M2.479 5.312C2.479 4.937 2.628 4.576 2.894 4.311C3.159 4.045 3.52 3.896 3.896 3.896H6.729L8.146 5.667H13.104C13.48 5.667 13.84 5.816 14.106 6.081C14.372 6.347 14.521 6.707 14.521 7.083V12.75C14.521 13.126 14.372 13.486 14.106 13.752C13.84 14.017 13.48 14.167 13.104 14.167H3.896C3.52 14.167 3.159 14.017 2.894 13.752C2.628 13.486 2.479 13.126 2.479 12.75V5.312Z", 1.34583)],
      "app-wa": [19, `<g clip-path="url(#pnwa19)"><path d="M13.8318 11.3858C13.5967 11.2678 12.44 10.6994 12.2247 10.6202C12.0086 10.5419 11.8518 10.5031 11.6943 10.739C11.5383 10.9741 11.0871 11.5037 10.9501 11.6605C10.8132 11.818 10.6754 11.837 10.4403 11.7199C10.2052 11.6011 9.44676 11.3533 8.54821 10.5522C7.84917 9.92832 7.37655 9.15803 7.23959 8.92211C7.10263 8.68699 7.22534 8.55953 7.3425 8.44236C7.44859 8.33707 7.57842 8.16765 7.69559 8.03069C7.81355 7.89294 7.85234 7.79478 7.93151 7.63724C8.00988 7.48049 7.97109 7.34353 7.91171 7.22557C7.85234 7.10761 7.38209 5.9494 7.18655 5.47836C6.99496 5.01999 6.80101 5.08253 6.65692 5.07461C6.51996 5.06828 6.36321 5.06669 6.20567 5.06669C6.04892 5.06669 5.79401 5.12528 5.57867 5.36119C5.36334 5.59632 4.75534 6.16553 4.75534 7.32374C4.75534 8.48115 5.59846 9.59978 5.71563 9.75732C5.83359 9.91407 7.37496 12.2907 9.73492 13.3095C10.2962 13.5518 10.734 13.6967 11.076 13.8043C11.6397 13.984 12.1527 13.9587 12.5572 13.8977C13.0093 13.8304 13.949 13.3285 14.1453 12.7791C14.3416 12.2297 14.3416 11.7587 14.2823 11.6605C14.2237 11.5623 14.0677 11.5037 13.8318 11.3858ZM9.53938 17.2465H9.53621C8.13478 17.2466 6.75911 16.8698 5.55334 16.1556L5.26755 15.9862L2.30592 16.7636L3.09601 13.8756L2.90996 13.5795C2.12656 12.332 1.71213 10.8884 1.71455 9.41532C1.71534 5.10074 5.22638 1.59048 9.54017 1.59048C11.6302 1.59048 13.5951 2.4059 15.0723 3.88474C15.8012 4.61039 16.3789 5.47339 16.7721 6.4238C17.1652 7.37421 17.3659 8.39315 17.3626 9.42165C17.3603 13.7362 13.85 17.2465 9.53701 17.2465M16.1973 2.76136C15.3253 1.88363 14.2879 1.18761 13.145 0.713618C12.0022 0.239628 10.7766 -0.00291854 9.53938 2.65008e-05C4.35001 2.65008e-05 0.126464 4.22357 0.124089 9.41453C0.124089 11.0739 0.55713 12.6936 1.38126 14.121L0.0449219 19L5.03638 17.6906C6.41672 18.4426 7.96352 18.8367 9.53542 18.8369H9.53938C14.728 18.8369 18.9523 14.6134 18.9547 9.42165C18.9585 8.18449 18.717 6.95886 18.2441 5.81564C17.7712 4.67242 17.0763 3.63431 16.1997 2.76136H16.1973Z" fill="currentColor"/></g><defs><clipPath id="pnwa19"><rect width="19" height="19" fill="white"/></clipPath></defs>`],
      // Tema (13px)
      "moon13": [13, s("M10.8333 7.85413C10.0376 8.19412 9.15837 8.28812 8.3088 8.12404C7.45924 7.95996 6.67826 7.5453 6.06642 6.93346C5.45459 6.32163 5.03993 5.54064 4.87585 4.69108C4.71177 3.84152 4.80577 2.96229 5.14576 2.16663C4.49421 2.44504 3.92086 2.87897 3.47595 3.43041C3.03104 3.98185 2.72813 4.63398 2.59377 5.32967C2.4594 6.02536 2.49768 6.74338 2.70524 7.42084C2.91281 8.0983 3.28332 8.71453 3.78434 9.21555C4.28536 9.71656 4.90159 10.0871 5.57905 10.2946C6.25651 10.5022 6.97453 10.5405 7.67022 10.4061C8.36591 10.2718 9.01803 9.96885 9.56948 9.52394C10.1209 9.07903 10.5549 8.50568 10.8333 7.85413Z", 0.920833)],
      "sun13": [13, s("M6.50016 8.66671C7.69678 8.66671 8.66683 7.69666 8.66683 6.50004C8.66683 5.30342 7.69678 4.33337 6.50016 4.33337C5.30355 4.33337 4.3335 5.30342 4.3335 6.50004C4.3335 7.69666 5.30355 8.66671 6.50016 8.66671Z", 0.920833) + s("M6.49984 1.35413V2.43746M6.49984 10.5625V11.6458M1.354 6.49996H2.43734M10.5623 6.49996H11.6457M2.87067 2.87079L3.629 3.62913M9.37067 9.37079L10.129 10.1291M2.87067 10.1291L3.629 9.37079M9.37067 3.62913L10.129 2.87079", 0.920833)],
      "mon13": [13, s("M10.2917 2.4375H2.70833C2.11002 2.4375 1.625 2.92252 1.625 3.52083V7.85417C1.625 8.45248 2.11002 8.9375 2.70833 8.9375H10.2917C10.89 8.9375 11.375 8.45248 11.375 7.85417V3.52083C11.375 2.92252 10.89 2.4375 10.2917 2.4375Z", 0.920833) + s("M4.3335 10.8333H8.66683M6.50016 8.9375V10.8333", 0.920833)],
      // "Se usa en" (12px)
      "arrow12": [12, s("M2.5 6H9.5M6.5 9L9.5 6L6.5 3", 0.85)],
      "inbox12": [12, s("M10.25 6.75V9.5H1.75V6.75L3 2.5H9L10.25 6.75ZM1.75 6.75H4L4.75 8H7.25L8 6.75H10.25", 0.85)],
      "users12": [12, s("M5.99961 6.14998C7.04895 6.14998 7.89961 5.29932 7.89961 4.24998C7.89961 3.20063 7.04895 2.34998 5.99961 2.34998C4.95027 2.34998 4.09961 3.20063 4.09961 4.24998C4.09961 5.29932 4.95027 6.14998 5.99961 6.14998Z", 0.85) + s("M2.25 10.25C2.65 8.35 4.15 7.25 6 7.25C7.85 7.25 9.35 8.35 9.75 10.25", 0.85)],
      "home12": [12, s("M2 5.25L6 2L10 5.25V9.5C10 9.69891 9.92098 9.88968 9.78033 10.0303C9.63968 10.171 9.44891 10.25 9.25 10.25H7.5V7.25H4.5V10.25H2.75C2.55109 10.25 2.36032 10.171 2.21967 10.0303C2.07902 9.88968 2 9.69891 2 9.5V5.25Z", 0.85)],
      "cal12": [12, s("M9 2.5H3C2.30964 2.5 1.75 3.05964 1.75 3.75V9C1.75 9.69036 2.30964 10.25 3 10.25H9C9.69036 10.25 10.25 9.69036 10.25 9V3.75C10.25 3.05964 9.69036 2.5 9 2.5Z", 0.85) + s("M1.75 5H10.25M4 1.5V3.5M8 1.5V3.5", 0.85)],
      "folder12": [12, s("M1.75 3.75C1.75 3.48478 1.85536 3.23043 2.04289 3.04289C2.23043 2.85536 2.48478 2.75 2.75 2.75H4.75L5.75 4H9.25C9.51522 4 9.76957 4.10536 9.95711 4.29289C10.1446 4.48043 10.25 4.73478 10.25 5V9C10.25 9.26522 10.1446 9.51957 9.95711 9.70711C9.76957 9.89464 9.51522 10 9.25 10H2.75C2.48478 10 2.23043 9.89464 2.04289 9.70711C1.85536 9.51957 1.75 9.26522 1.75 9V3.75Z", 0.85)],
      "inv12": [12, s("M8.25 1.5H3.75C3.05964 1.5 2.5 2.05964 2.5 2.75V9.25C2.5 9.94036 3.05964 10.5 3.75 10.5H8.25C8.94036 10.5 9.5 9.94036 9.5 9.25V2.75C9.5 2.05964 8.94036 1.5 8.25 1.5Z", 0.85) + s("M4.25 3.5H7.75M4.25 5.5H7.75M4.25 7.5H6.25", 0.85)]
    });
    const MAIL_KEY = "141_mail_creds";
    const _mailCreds = () => {
      try {
        return JSON.parse(localStorage.getItem(MAIL_KEY) || "null");
      } catch (_) {
        return null;
      }
    };
    const _two = (n) => String(n || "").trim().split(/\s+/).slice(0, 2).join(" ");
    const _phone = (p) => {
      const d = String(p || "").replace(/[^\d+]/g, "");
      const m = d.match(/^\+?34(\d{3})(\d{3})(\d{3})$/);
      return m ? `+34 ${m[1]} ${m[2]} ${m[3]}` : String(p || "").trim();
    };
    const _zone = () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        const city = (tz.split("/").pop() || "").replace(/_/g, " ");
        const off = (/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: tz, timeZoneName: "shortOffset" }).split(" ").pop() || "";
        const lang = (() => {
          try {
            return PN.cap(new Intl.DisplayNames(["es"], { type: "language" }).of((document.documentElement.lang || navigator.language || "es").slice(0, 2)));
          } catch (_) {
            return "Espa\xF1ol";
          }
        })();
        return `${lang} \xB7 ${city}${off ? ` (${off})` : ""}`;
      } catch (_) {
        return "Espa\xF1ol";
      }
    };
    const _eur = (cents) => String(Math.round((Number(cents) || 0) / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " \u20AC";
    const useIntegrations = () => {
      const D = window.Data;
      const [wa, setWa] = useState(null), [g, setG] = useState(null), [stripe, setStripe] = useState(null);
      const [mail, setMailS] = useState(_mailCreds);
      const load = async () => {
        try {
          setWa(D.whatsappStatus ? await D.whatsappStatus() : { connected: false });
        } catch (_) {
          setWa({ connected: false });
        }
        try {
          setG(D.googleStatus ? await D.googleStatus() : { connected: false });
        } catch (_) {
          setG({ connected: false });
        }
        try {
          const res = window.apiFetch ? await window.apiFetch("/api/stripe/balance", {}) : null;
          const r = res ? await res.json().catch(() => null) : null;
          setStripe(r && r.ok ? r : { ok: false });
        } catch (_) {
          setStripe({ ok: false });
        }
      };
      useEffect(() => {
        load();
      }, []);
      const setMail = (c) => {
        setMailS(c);
        try {
          c ? localStorage.setItem(MAIL_KEY, JSON.stringify(c)) : localStorage.removeItem(MAIL_KEY);
        } catch (_) {
        }
      };
      return { wa, g, stripe, mail, setMail, reload: load };
    };
    const Sheet = ({ title, onClose, children, width = 440 }) => ReactDOM.createPortal(
      /* @__PURE__ */ React.createElement("div", { className: "pn-sheet-bg", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: "pn-sheet", style: { maxWidth: width }, onClick: (e) => e.stopPropagation() }, title && /* @__PURE__ */ React.createElement("p", { className: "t-title-m", style: { color: "var(--ink-900)", marginBottom: 14 } }, title), children)),
      document.body
    );
    const Toggle = ({ on, onChange, small }) => /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "pn-toggle" + (small ? " sm" : "") + (on ? " on" : ""),
        role: "switch",
        "aria-checked": !!on,
        disabled: !onChange,
        onClick: onChange ? () => onChange(!on) : void 0
      },
      /* @__PURE__ */ React.createElement("i", null)
    );
    const NotifTab = () => {
      const P = window.PushKit.usePush();
      const st = P.state;
      const can = st === "off" || st === "on";
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "t-small pn-pintro" }, "Recibe los avisos del CRM como notificaciones del m\xF3vil o del ordenador, tambi\xE9n con la app cerrada."), /* @__PURE__ */ React.createElement("div", { className: "pn-datos" }, /* @__PURE__ */ React.createElement("div", { className: "pn-dato pn-push" }, /* @__PURE__ */ React.createElement("div", { className: "lb" }, /* @__PURE__ */ React.createElement(PIcon, { name: "bell15" }), /* @__PURE__ */ React.createElement("span", null, "Este dispositivo")), /* @__PURE__ */ React.createElement("p", { className: "v" + (st === "on" ? "" : " ph"), style: { whiteSpace: "normal" } }, st === null ? "Comprobando\u2026" : window.PushKit.pushHelp(st, P.isIOS)), st === "on" && /* @__PURE__ */ React.createElement("button", { className: "pn-gbtn", disabled: P.busy, onClick: P.test }, "Probar"), st === "on" && /* @__PURE__ */ React.createElement("button", { className: "pn-gbtn", disabled: P.busy, onClick: P.disable }, "Desactivar"), st === "off" && /* @__PURE__ */ React.createElement("button", { className: "pn-cbtn lg", disabled: P.busy, onClick: P.enable }, P.busy ? "Activando\u2026" : "Activar"))), P.msg && /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "var(--gray-400)", margin: "10px 2px 0" } }, P.msg), /* @__PURE__ */ React.createElement("p", { className: "t-small pn-psec" }, "Qu\xE9 te avisa"), /* @__PURE__ */ React.createElement("div", { className: "pn-datos" }, P.kinds.map((k) => /* @__PURE__ */ React.createElement("div", { key: k.k, className: "pn-dato", style: { opacity: can ? 1 : 0.5 } }, /* @__PURE__ */ React.createElement("div", { className: "lb", style: { width: 230 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ink-900)", fontWeight: 500 } }, k.label)), /* @__PURE__ */ React.createElement("p", { className: "v ph", style: { fontWeight: 400 } }, k.sub), /* @__PURE__ */ React.createElement(Toggle, { on: P.prefs[k.k], small: true, onChange: can ? (v) => P.setPref(k.k, v) : void 0 })))));
    };
    const PanelProfile = ({ navigate, session, theme, setTheme }) => {
      const D = window.Data;
      D.useStore();
      const toast = typeof useToast === "function" ? useToast() : null;
      const S = D.SETTINGS || {};
      const I = useIntegrations();
      const [tab, setTab] = useState("profile");
      const [full, setFull] = useState(false);
      const [sheet, setSheet] = useState(null);
      const [edit, setEdit] = useState(null);
      const [draft, setDraft] = useState("");
      const [open, setOpen] = useState({ mail: true });
      const [mode, setMode] = useState(null);
      const name = session && session.name || "";
      const email = session && session.email || "";
      const agency = S.name || "";
      if (full && window.SettingsPage) {
        return /* @__PURE__ */ React.createElement("div", { className: "pn-legacy-full" }, /* @__PURE__ */ React.createElement("div", { className: "pn-legacy-bar" }, /* @__PURE__ */ React.createElement("button", { className: "pn-back t-small", onClick: () => setFull(false) }, /* @__PURE__ */ React.createElement(PIcon, { name: "back" }), /* @__PURE__ */ React.createElement("span", null, "Volver al perfil"))), /* @__PURE__ */ React.createElement(window.SettingsPage, null));
      }
      const connectGoogle = async () => {
        const r = await D.googleAuthUrl(email || void 0);
        if (!r || !r.ok || !r.url) {
          toast && toast(r && r.error || "No se pudo iniciar la conexi\xF3n con Google", "error");
          return;
        }
        const w = window.open(r.url, "google-oauth", "width=480,height=660");
        const onMsg = (ev) => {
          if (!ev.data || ev.data.source !== "google-oauth") return;
          window.removeEventListener("message", onMsg);
          if (ev.data.status === "connected") {
            toast && toast("Google conectado", "success");
            I.reload();
          } else toast && toast(ev.data.error || "No se pudo conectar con Google", "error");
          try {
            if (w) w.close();
          } catch (_) {
          }
        };
        window.addEventListener("message", onMsg);
      };
      const connectWa = async () => {
        const st = I.wa || {};
        const launch = window.PNInboxKit && window.PNInboxKit.waLaunch;
        if (!st.configured || !launch) {
          setSheet({ kind: "soon", title: "WhatsApp", text: "La conexi\xF3n de WhatsApp Business todav\xEDa no est\xE1 configurada en el servidor. En cuanto lo est\xE9, podr\xE1s vincular tu n\xFAmero desde aqu\xED." });
          return;
        }
        const r = await launch(st);
        if (r.error || !r.code) {
          toast && toast(r.error || "No se recibi\xF3 el c\xF3digo", "error");
          return;
        }
        const out = await D.connectWhatsapp({ code: r.code, phone_number_id: r.phone_number_id, waba_id: r.waba_id });
        if (out && out.ok) {
          toast && toast("WhatsApp conectado", "success");
          I.reload();
        } else toast && toast(out && out.error || "No se pudo conectar", "error");
      };
      const waOn = !!(I.wa && I.wa.connected), gOn = !!(I.g && I.g.connected), mailOn = !!(I.mail && I.mail.email);
      const stripeOn = !!(I.stripe && I.stripe.ok), driveOn = !!D.driveConfigured;
      const loaded = (k) => k === "mail" || k === "drive" || k === "shopify" || k === "cold" || (k === "wa" ? I.wa : k === "gcal" ? I.g : I.stripe) !== null;
      const APPS = [
        {
          k: "mail",
          name: "Gmail",
          bg: "#eb4236",
          icon: "app-mail",
          desc: mailOn ? I.mail.email : "Tu correo en la Bandeja",
          on: mailOn,
          account: mailOn ? I.mail.email : "",
          uses: [["inbox12", "Bandeja"], ["users12", "Clientes"]],
          connect: () => setSheet({ kind: "mail" }),
          manage: () => setSheet({ kind: "mailManage" }),
          options: [["Tus correos entran en la Bandeja", true, true], ["Crear el cliente cuando escribe alguien nuevo", false], ["Nora te propone la respuesta", false]]
        },
        {
          k: "wa",
          name: "WhatsApp",
          bg: "#25d366",
          icon: "app-wa",
          desc: "Clientes y avisos",
          on: waOn,
          account: waOn ? _phone(I.wa.display_phone) || "Conectado" : "",
          uses: [["inbox12", "Bandeja"], ["home12", "Avisos de Inicio"]],
          connect: connectWa,
          manage: () => setSheet({ kind: "waManage" })
        },
        {
          k: "gcal",
          name: "Google Calendar",
          icon: "app-cal",
          desc: "Eventos y reuniones",
          on: gOn,
          account: gOn ? I.g.email || "Conectado" : "",
          uses: [["cal12", "Calendario"], ["home12", "Inicio"]],
          connect: connectGoogle,
          manage: () => setSheet({ kind: "gManage" })
        },
        {
          k: "drive",
          name: "Google Drive",
          icon: "app-folder",
          desc: "Carpetas de clientes",
          on: driveOn,
          account: driveOn ? `${(D.CLIENTS || []).filter((c) => c.driveUrl).length} carpetas` : "",
          only: "list",
          uses: [["users12", "Clientes"]],
          connect: () => setSheet({ kind: "drive" }),
          manage: () => setSheet({ kind: "drive" })
        },
        {
          k: "shopify",
          name: "Shopify Partners",
          icon: "app-bag",
          desc: "Tus tiendas",
          on: false,
          uses: [["folder12", "Proyectos"], ["users12", "Clientes"]],
          connect: () => setSheet({ kind: "soon", title: "Shopify Partners", text: "Esta integraci\xF3n todav\xEDa no est\xE1 disponible." })
        },
        {
          k: "stripe",
          name: "Stripe",
          icon: "app-card",
          desc: "Cobros de facturas",
          on: stripeOn,
          account: stripeOn ? `${_eur(I.stripe.available)} disponibles` : "",
          uses: [["inv12", "Facturas"]],
          connect: () => setSheet({ kind: "soon", title: "Stripe", text: "Stripe se activa con la clave secreta del servidor (STRIPE_SK). En cuanto est\xE9, aqu\xED ver\xE1s el saldo y los cobros." }),
          manage: () => setSheet({ kind: "stripeManage" })
        },
        {
          k: "cold",
          name: "Cold email",
          icon: "app-send",
          desc: "Campa\xF1as de captaci\xF3n",
          on: false,
          uses: [["inbox12", "Bandeja"], ["spark", "Seguimientos"]],
          connect: () => setSheet({ kind: "soon", title: "Cold email", text: "Esta integraci\xF3n todav\xEDa no est\xE1 disponible." })
        }
      ];
      const GRID = ["wa", "mail", "gcal", "shopify", "stripe", "cold"].map((k) => APPS.find((a) => a.k === k));
      const LIST = ["mail", "wa", "gcal", "drive", "shopify", "stripe", "cold"].map((k) => APPS.find((a) => a.k === k));
      const startEdit = (k, v) => {
        setEdit(k);
        setDraft(v || "");
      };
      const saveEdit = () => {
        if (edit === "phone") D.updateSettings({ phone: draft.trim() });
        setEdit(null);
      };
      const ROWS = [
        { k: "name", icon: "user15", l: "Nombre", v: name, ph: "Sin nombre" },
        { k: "email", icon: "mail15", l: "Email", v: email },
        { k: "phone", icon: "wa15", l: "WhatsApp", v: _phone(S.phone), ph: "+34 \xB7 tu n\xFAmero", edit: () => startEdit("phone", S.phone) },
        { k: "company", icon: "bldg15", l: "Empresa", v: [agency, S.tagline].filter(Boolean).join(" \xB7 "), ph: "Nombre de tu agencia", edit: () => setFull(true) },
        { k: "zone", icon: "globe15", l: "Idioma y zona", v: _zone() }
      ];
      const themeMode = mode || (theme === "light" ? "light" : "dark");
      const pickTheme = (m) => {
        setMode(m === "auto" ? "auto" : null);
        const t = m === "auto" ? window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark" : m;
        setTheme && setTheme(t);
      };
      const Right = ({ a, list }) => {
        if (!loaded(a.k)) return null;
        if (!a.on) return /* @__PURE__ */ React.createElement("button", { className: list ? "pn-cbtn lg" : "pn-cbtn", onClick: a.connect }, "Conectar");
        if (!list) return /* @__PURE__ */ React.createElement("span", { className: "pn-okb" }, /* @__PURE__ */ React.createElement(PIcon, { name: "check11" }));
        return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "pn-conn" }, /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("span", null, a.account)), /* @__PURE__ */ React.createElement("button", { className: "pn-gbtn", onClick: a.manage }, "Gestionar"), a.options && /* @__PURE__ */ React.createElement("button", { className: "pn-xchev" + (open[a.k] ? " up" : ""), "aria-label": "Opciones", onClick: () => setOpen((o) => ({ ...o, [a.k]: !o[a.k] })) }, /* @__PURE__ */ React.createElement(PIcon, { name: "chev15" })));
      };
      const ProfileTab = () => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "t-small pn-psec" }, "Tus datos"), /* @__PURE__ */ React.createElement("div", { className: "pn-datos" }, ROWS.map((r) => /* @__PURE__ */ React.createElement("div", { key: r.k, className: "pn-dato" }, /* @__PURE__ */ React.createElement("div", { className: "lb" }, /* @__PURE__ */ React.createElement(PIcon, { name: r.icon }), /* @__PURE__ */ React.createElement("span", null, r.l)), edit === r.k ? /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "pn-inline",
          autoFocus: true,
          value: draft,
          onChange: (e) => setDraft(e.target.value),
          placeholder: r.ph,
          onKeyDown: (e) => {
            if (e.key === "Enter") saveEdit();
            if (e.key === "Escape") setEdit(null);
          },
          onBlur: saveEdit
        }
      ) : /* @__PURE__ */ React.createElement("p", { className: "v" + (r.v ? "" : " ph") }, r.v || r.ph), r.edit && edit !== r.k && /* @__PURE__ */ React.createElement("button", { className: "ed", onClick: r.edit }, "Editar")))), /* @__PURE__ */ React.createElement("div", { className: "pn-psec row" }, /* @__PURE__ */ React.createElement("p", { className: "t-small" }, "Integraciones"), /* @__PURE__ */ React.createElement("span", { style: { flex: 1 } }), /* @__PURE__ */ React.createElement("button", { className: "more", onClick: () => setTab("apps") }, "Ver todas")), /* @__PURE__ */ React.createElement("div", { className: "pn-agrid" }, GRID.map((a) => /* @__PURE__ */ React.createElement("div", { key: a.k, className: "pn-acard" }, /* @__PURE__ */ React.createElement("span", { className: "ic", style: a.bg ? { background: a.bg } : null }, /* @__PURE__ */ React.createElement(PIcon, { name: a.icon })), /* @__PURE__ */ React.createElement("div", { className: "txt" }, /* @__PURE__ */ React.createElement("p", { className: "nm" }, a.name), /* @__PURE__ */ React.createElement("p", { className: "sb" }, a.desc)), /* @__PURE__ */ React.createElement(Right, { a })))), /* @__PURE__ */ React.createElement("p", { className: "t-small pn-psec" }, "Preferencias"), /* @__PURE__ */ React.createElement("div", { className: "pn-prefs" }, /* @__PURE__ */ React.createElement("div", { className: "pn-pref theme" }, /* @__PURE__ */ React.createElement("p", { className: "nm" }, "Tema"), /* @__PURE__ */ React.createElement("div", { className: "pn-tsel" }, [["dark", "moon13", "Oscuro"], ["light", "sun13", "Claro"], ["auto", "mon13", "Auto"]].map(([k, ic, l]) => /* @__PURE__ */ React.createElement("button", { key: k, className: themeMode === k ? "on" : "", onClick: () => pickTheme(k) }, /* @__PURE__ */ React.createElement(PIcon, { name: ic }), /* @__PURE__ */ React.createElement("span", null, l))))), /* @__PURE__ */ React.createElement("div", { className: "pn-pref", title: "Todav\xEDa no disponible" }, /* @__PURE__ */ React.createElement("span", { className: "bi" }, /* @__PURE__ */ React.createElement(PIcon, { name: "bell15" })), /* @__PURE__ */ React.createElement("div", { className: "txt" }, /* @__PURE__ */ React.createElement("p", { className: "nm" }, "Resumen diario por WhatsApp"), /* @__PURE__ */ React.createElement("p", { className: "sb" }, "Cada d\xEDa a las 9:00")), /* @__PURE__ */ React.createElement(Toggle, { on: false }))));
      const AppsTab = () => /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "t-small pn-pintro" }, "Conecta una app y su informaci\xF3n aparece sola en el panel."), /* @__PURE__ */ React.createElement("div", { className: "pn-alist" }, LIST.map((a) => {
        const ex = a.on && a.options && open[a.k];
        return /* @__PURE__ */ React.createElement("div", { key: a.k, className: "pn-arow" + (ex ? " ex" : "") }, /* @__PURE__ */ React.createElement("div", { className: "top" }, /* @__PURE__ */ React.createElement("span", { className: "ic", style: a.bg ? { background: a.bg } : null }, /* @__PURE__ */ React.createElement(PIcon, { name: a.icon, size: a.k === "wa" ? 21 : 19 })), /* @__PURE__ */ React.createElement("div", { className: "txt" }, /* @__PURE__ */ React.createElement("p", { className: "nm" }, a.name), /* @__PURE__ */ React.createElement("div", { className: "uses" }, /* @__PURE__ */ React.createElement(PIcon, { name: "arrow12" }), a.uses.map(([ic, l]) => /* @__PURE__ */ React.createElement("span", { key: l, className: "pn-uchip" }, /* @__PURE__ */ React.createElement(PIcon, { name: ic, size: 12 }), l)))), /* @__PURE__ */ React.createElement(Right, { a, list: true })), ex && /* @__PURE__ */ React.createElement("div", { className: "opts" }, a.options.map(([l, on, real]) => /* @__PURE__ */ React.createElement("div", { key: l, className: "opt", title: real ? void 0 : "Todav\xEDa no disponible" }, /* @__PURE__ */ React.createElement("p", null, l), /* @__PURE__ */ React.createElement(Toggle, { on, small: true })))));
      })));
      const SoonTab = ({ t, d }) => /* @__PURE__ */ React.createElement("div", { className: "pn-empty", style: { paddingTop: 4 } }, /* @__PURE__ */ React.createElement("p", { className: "t-title-m", style: { color: "var(--ink-900)" } }, t), /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "var(--gray-400)" } }, d));
      const TABS = [["profile", "Perfil"], ["team", "Equipo"], ["apps", "Integraciones"], ["notif", "Notificaciones"], ["plan", "Plan"]];
      const MailSetupC = window.MailSetup, DriveCardC = window.DriveCard;
      return /* @__PURE__ */ React.createElement("div", { className: "pn-stage" }, /* @__PURE__ */ React.createElement("div", { className: "pn-scroll", style: { top: 0, bottom: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "pn-col pn-prof" + (tab === "apps" ? " apps" : "") }, /* @__PURE__ */ React.createElement("div", { className: "pn-phd" }, /* @__PURE__ */ React.createElement("div", { className: "av" }, PN.initials(name) || "\xB7"), /* @__PURE__ */ React.createElement("div", { className: "nmc" }, /* @__PURE__ */ React.createElement("p", { className: "t-h2" }, _two(name) || "Tu perfil"), /* @__PURE__ */ React.createElement("div", { className: "rol" }, /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("span", null, "Disponible", agency ? ` \xB7 Admin de ${agency}` : ""))), /* @__PURE__ */ React.createElement("button", { className: "pn-logout", onClick: () => navigate("__logout") }, /* @__PURE__ */ React.createElement(PIcon, { name: "logout14" }), /* @__PURE__ */ React.createElement("span", null, "Cerrar sesi\xF3n"))), /* @__PURE__ */ React.createElement("div", { className: "pn-ptabs2" }, TABS.map(([k, l]) => /* @__PURE__ */ React.createElement("button", { key: k, className: tab === k ? "on" : "", onClick: () => setTab(k) }, l))), tab === "profile" && ProfileTab(), tab === "apps" && AppsTab(), tab === "team" && /* @__PURE__ */ React.createElement(SoonTab, { t: "Solo est\xE1s t\xFA", d: "Cuando invites a alguien de tu equipo aparecer\xE1 aqu\xED." }), tab === "notif" && (window.PushKit ? /* @__PURE__ */ React.createElement(NotifTab, null) : /* @__PURE__ */ React.createElement(SoonTab, { t: "Sin ajustes de avisos todav\xEDa", d: "Los avisos llegan a la campana y a Inicio." })), tab === "plan" && /* @__PURE__ */ React.createElement(SoonTab, { t: "Sin plan que mostrar", d: "Aqu\xED ver\xE1s tu plan y tus facturas de 141'Digital." }))), sheet && sheet.kind === "mail" && /* @__PURE__ */ React.createElement(Sheet, { title: "Conectar correo", onClose: () => setSheet(null), width: 480 }, MailSetupC ? /* @__PURE__ */ React.createElement("div", { className: "pn-legacy-block" }, /* @__PURE__ */ React.createElement(MailSetupC, { embedded: true, onConnect: (c) => {
        I.setMail(c);
        setSheet(null);
        toast && toast("Correo conectado", "success");
      } })) : /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "var(--gray-400)" } }, "No se pudo cargar el formulario de correo.")), sheet && sheet.kind === "mailManage" && /* @__PURE__ */ React.createElement(Sheet, { title: "Correo", onClose: () => setSheet(null) }, /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "#ccc" } }, "Conectado como ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--ink-900)", fontWeight: 500 } }, I.mail && I.mail.email), "."), /* @__PURE__ */ React.createElement("div", { className: "pn-sheet-acts" }, /* @__PURE__ */ React.createElement("button", { className: "pn-gbtn", onClick: () => setSheet({ kind: "mail" }) }, "Cambiar cuenta"), /* @__PURE__ */ React.createElement("button", { className: "pn-gbtn red", onClick: () => {
        I.setMail(null);
        setSheet(null);
      } }, "Desconectar"))), sheet && sheet.kind === "waManage" && /* @__PURE__ */ React.createElement(Sheet, { title: "WhatsApp", onClose: () => setSheet(null) }, /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "#ccc" } }, "N\xFAmero conectado", I.wa && I.wa.display_phone ? /* @__PURE__ */ React.createElement(React.Fragment, null, ": ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--ink-900)", fontWeight: 500 } }, _phone(I.wa.display_phone))) : "", ". Sigues usando el m\xF3vil con normalidad (coexistencia)."), /* @__PURE__ */ React.createElement("div", { className: "pn-sheet-acts" }, /* @__PURE__ */ React.createElement("button", { className: "pn-gbtn", onClick: () => {
        setSheet(null);
        navigate("unibox");
      } }, "Abrir la Bandeja"))), sheet && sheet.kind === "gManage" && /* @__PURE__ */ React.createElement(Sheet, { title: "Google Calendar", onClose: () => setSheet(null) }, /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "#ccc" } }, "Conectado", I.g && I.g.email ? /* @__PURE__ */ React.createElement(React.Fragment, null, " como ", /* @__PURE__ */ React.createElement("b", { style: { color: "var(--ink-900)", fontWeight: 500 } }, I.g.email)) : "", ". Las reuniones con Meet se crean en este calendario."), /* @__PURE__ */ React.createElement("div", { className: "pn-sheet-acts" }, /* @__PURE__ */ React.createElement("button", { className: "pn-gbtn", onClick: () => {
        setSheet(null);
        connectGoogle();
      } }, "Volver a conectar"))), sheet && sheet.kind === "stripeManage" && /* @__PURE__ */ React.createElement(Sheet, { title: "Stripe", onClose: () => setSheet(null) }, /* @__PURE__ */ React.createElement("div", { className: "pn-stats" }, /* @__PURE__ */ React.createElement("div", { className: "st" }, /* @__PURE__ */ React.createElement("p", { className: "t-caption l" }, "Disponible"), /* @__PURE__ */ React.createElement("p", { className: "v" }, _eur(I.stripe.available))), /* @__PURE__ */ React.createElement("div", { className: "st" }, /* @__PURE__ */ React.createElement("p", { className: "t-caption l" }, "Pendiente"), /* @__PURE__ */ React.createElement("p", { className: "v" }, _eur(I.stripe.pending))))), sheet && sheet.kind === "drive" && /* @__PURE__ */ React.createElement(Sheet, { title: "Google Drive", onClose: () => setSheet(null), width: 560 }, DriveCardC ? /* @__PURE__ */ React.createElement("div", { className: "pn-legacy-block" }, /* @__PURE__ */ React.createElement(DriveCardC, null)) : null), sheet && sheet.kind === "soon" && /* @__PURE__ */ React.createElement(Sheet, { title: sheet.title, onClose: () => setSheet(null) }, /* @__PURE__ */ React.createElement("p", { className: "t-small", style: { color: "#ccc" } }, sheet.text)));
    };
    window.PanelProfile = PanelProfile;
  })();
})();
