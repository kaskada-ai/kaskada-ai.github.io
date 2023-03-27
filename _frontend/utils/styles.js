export function calculateWindowHeight() {
  const $navbar = document.querySelector("nav.navbar");
  const $style = document.createElement("style");
  const height = window.innerHeight;

  $style.innerHTML = `:root {
    --window-height: ${height}px;
    --navbar-height: ${$navbar.clientHeight}px;
  }`;

  document.head.appendChild($style);
}
