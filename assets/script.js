// Shared helpers
const API_BASE = "https://hostelproxy.sakshamsikarwar7024.workers.dev";

function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return document.querySelectorAll(sel); }

async function postJSON(path, body){
  const url = API_BASE + path;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    try { return { ok: res.ok, data: await res.json() }; }
    catch(e) { return { ok: res.ok, data: await res.text() }; }
  } catch(err){
    return { ok:false, error: err.message };
  }
}

// token helpers
function storeToken(kind, token){
  try{ localStorage.setItem(kind + "Token", token); } catch(e){ console.warn("Storage blocked", e); }
}
function getToken(kind){ return localStorage.getItem(kind + "Token"); }

// simple redirect helper
function safeRedirect(path){
  window.location.href = path;
}

/* Small UX helper for login forms:
  form element must have data-kind="student" or "admin" and inputs with
  name="email"/"password" or name="username"/"pwd" accordingly.
*/
document.addEventListener("submit", async (e)=>{
  const form = e.target;
  if(!form.matches(".auto-login")) return; // only handle forms we mark
  e.preventDefault();
  const kind = form.dataset.kind; // "student" or "admin"
  const out = form.querySelector(".out");
  out.textContent = "Logging in...";

  // collect fields
  const formData = new FormData(form);
  const body = {};
  for(const [k,v] of formData.entries()) body[k]=v;

  const apiPath = kind === "admin" ? "/login-admin" : "/login-student";
  const resp = await postJSON(apiPath, body);
  if(!resp.ok){
    out.textContent = resp.error ? ("Network error: " + resp.error) : "Login failed.";
    return;
  }
  const data = resp.data;
  // if object and token -> success
  if(typeof data === "object" && data !== null && (data.token || data.success)){
    if(data.token) storeToken(kind, data.token);
    out.textContent = "Login successful. Redirecting...";
    setTimeout(()=> safeRedirect(kind === "admin" ? "admin-dashboard.html" : "student-dashboard.html"), 600);
    return;
  }
  // if string and contains ok
  if(typeof data === "string" && /ok|success/i.test(data)){
    out.textContent = "Login successful. Redirecting...";
    setTimeout(()=> safeRedirect(kind === "admin" ? "admin-dashboard.html" : "student-dashboard.html"), 600);
    return;
  }
  // fallback show message
  out.textContent = data.error || JSON.stringify(data);
});
