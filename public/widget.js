/**
 * ChatPilot embeddable widget.
 * Usage on any website:
 *   <script src="https://YOURAPP/widget.js" data-widget-id="XXXX" async></script>
 *
 * It injects a floating chat button and, when clicked, opens an iframe that
 * loads the business's chat panel from /embed/<widgetId>.
 */
(function () {
  var script = document.currentScript;
  if (!script) return;

  var widgetId = script.getAttribute("data-widget-id");
  if (!widgetId) {
    console.error("[ChatPilot] Missing data-widget-id on the script tag.");
    return;
  }

  // Base URL = where this script was served from.
  var origin = new URL(script.src).origin;
  var accent = script.getAttribute("data-color") || "#ec6745";

  // ---- Floating button ----
  var btn = document.createElement("button");
  btn.setAttribute("aria-label", "Open chat");
  btn.innerHTML = "&#128172;"; // 💬
  var btnStyle = {
    position: "fixed",
    right: "22px",
    bottom: "22px",
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    fontSize: "26px",
    background: accent,
    boxShadow: "0 8px 24px rgba(0,0,0,.28)",
    zIndex: "2147483000",
  };
  for (var k in btnStyle) btn.style[k] = btnStyle[k];

  // ---- Optional visitor identity from the host site ----
  // If the host page knows who's logged in, it sets:
  //   window.ChatPilot = { user: { name: "...", email: "..." } };
  // We forward that into the iframe so the agent already has their contact.
  function identityParam() {
    try {
      var u = window.ChatPilot && window.ChatPilot.user;
      if (!u) return "";
      var slim = {};
      if (typeof u.name === "string") slim.name = u.name;
      if (typeof u.email === "string") slim.email = u.email;
      if (!slim.name && !slim.email) return "";
      return "?u=" + encodeURIComponent(JSON.stringify(slim));
    } catch (e) {
      return "";
    }
  }

  // ---- Chat iframe ----
  var frame = document.createElement("iframe");
  frame.src =
    origin + "/embed/" + encodeURIComponent(widgetId) + identityParam();
  frame.title = "Chat";
  var frameStyle = {
    position: "fixed",
    right: "22px",
    bottom: "92px",
    width: "370px",
    height: "540px",
    maxWidth: "calc(100vw - 32px)",
    maxHeight: "calc(100vh - 120px)",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 24px 60px rgba(0,0,0,.45)",
    zIndex: "2147483000",
    display: "none",
    background: "#0c1220",
  };
  for (var j in frameStyle) frame.style[j] = frameStyle[j];

  var open = false;
  btn.addEventListener("click", function () {
    open = !open;
    frame.style.display = open ? "block" : "none";
    btn.innerHTML = open ? "&#10005;" : "&#128172;"; // ✕ / 💬
  });

  function mount() {
    document.body.appendChild(frame);
    document.body.appendChild(btn);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
