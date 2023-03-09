function calculateWindowHeight() {
  const height = window.innerHeight;
  const style = document.createElement("style");
  style.innerHTML = ":root { --window-height: " + height + "px; }";
  document.head.appendChild(style);
}

addEventListener("DOMContentLoaded", function () {
  calculateWindowHeight();

  window.addEventListener("resize", calculateWindowHeight());
});
