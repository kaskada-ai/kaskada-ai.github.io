function calculateWindowHeight() {
  const $navbar = document.querySelector("nav.navbar");
  const height = window.innerHeight;
  const style = document.createElement("style");
  style.innerHTML = `:root {
    --window-height: ${height}px;
    --navbar-height: ${$navbar.clientHeight}px;
  }`;
  document.head.appendChild(style);
}

addEventListener("DOMContentLoaded", function () {
  calculateWindowHeight();

  window.addEventListener("resize", calculateWindowHeight());
});
