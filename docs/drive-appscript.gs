/**
 * 141'DIGITAL — Creación automática de carpetas en Google Drive.
 *
 * Este Web App corre bajo TU cuenta de Google, así que ya tiene acceso a tu
 * Drive (no hace falta Google Cloud ni pantallas de consentimiento). La app le
 * avisa al crear un cliente o un proyecto; él crea la carpeta y escribe la URL
 * de vuelta en Supabase.
 *
 * ── PASOS (una sola vez) ──────────────────────────────────────────────────
 * 1. Ve a https://script.google.com  →  «Nuevo proyecto».
 * 2. Pega TODO este archivo en el editor (sustituye lo que haya).
 * 3. Rellena las 4 constantes de CONFIG de abajo.
 * 4. Implementar → Nueva implementación → tipo «Aplicación web».
 *      - Ejecutar como: «Yo».
 *      - Quién tiene acceso: «Cualquier usuario».
 *    Copia la URL que termina en /exec.
 * 5. En la app: Ajustes → «Google Drive · carpetas automáticas» → pega esa URL
 *    y el mismo SECRET de abajo. Guardar.
 *
 * Nota: las carpetas se comparten como «cualquiera con el enlace puede ver»,
 * para que el cliente pueda abrirlas desde su portal.
 */

// ── CONFIG ────────────────────────────────────────────────────────────────
var SECRET        = "PON-AQUI-UNA-CLAVE-LARGA-AL-AZAR"; // el mismo que pondrás en la app
var SUPABASE_URL  = "https://TU-PROYECTO.supabase.co";  // URL de tu proyecto Supabase
var SERVICE_KEY   = "TU_SERVICE_ROLE_KEY";              // Supabase → Project Settings → API → service_role
var ROOT_FOLDER_ID = "ID_DE_LA_CARPETA_RAIZ";           // carpeta de Drive donde van todos los clientes
// (el ID es lo que va después de /folders/ en la URL de la carpeta)

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRET) return _json({ error: "bad secret" });
    var name = String(body.name || "Carpeta");

    if (body.action === "client") {
      var f = _make(ROOT_FOLDER_ID, name);
      _patch("clients", body.clientId, f);
      return _json({ ok: true, url: f.url });
    }
    if (body.action === "project") {
      var parent = body.parentId || ROOT_FOLDER_ID;
      var f = _make(parent, name);
      _patch("projects", body.projectId, f);
      return _json({ ok: true, url: f.url });
    }
    return _json({ error: "unknown action" });
  } catch (err) {
    return _json({ error: String(err) });
  }
}

// Prueba rápida en el navegador: abre la URL .../exec y debe responder "ok".
function doGet() { return _json({ ok: true, msg: "141 Drive webhook activo" }); }

function _make(parentId, name) {
  var parent = DriveApp.getFolderById(parentId);
  var folder = parent.createFolder(name);
  try { folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
  return { id: folder.getId(), url: folder.getUrl() };
}

function _patch(table, id, f) {
  if (!id) return;
  UrlFetchApp.fetch(SUPABASE_URL + "/rest/v1/" + table + "?id=eq." + encodeURIComponent(id), {
    method: "patch",
    contentType: "application/json",
    headers: { apikey: SERVICE_KEY, Authorization: "Bearer " + SERVICE_KEY, Prefer: "return=minimal" },
    payload: JSON.stringify({ drive_url: f.url, drive_folder_id: f.id }),
    muteHttpExceptions: true,
  });
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
