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

function initializeNewsletter() {
  if (MktoForms2) {
    MktoForms2.loadForm("//pages.datastax.com", "259-IFZ-779", 4727, (form) => {
      const $newsletter = document.querySelector("form[newsletter-form]");
      const $button = $newsletter.querySelector('button[type="submit"]');

      if ($button) {
        $button.disabled = false;
      }

      $newsletter.addEventListener("submit", (event) => {
        event.preventDefault();
        const $email = $newsletter.querySelector('input[name="email"]');

        window.theform = form;
        form.setValues({
          Email: $email.value,
        });

        $("#newsletter-modal").modal("show");

        setTimeout(() => {
          document.querySelector("#mktoForm_4727 #Email").focus();
        }, 500);
      });
    });
  }
}

function listenNewsletterFocus() {
  const $form = document.querySelector("form#mktoForm_4727");

  if ($form) {
    const $input = document.getElementById("newsletter-email");
    $input.addEventListener("focus", initializeNewsletter);
  }
}

addEventListener("DOMContentLoaded", function () {
  calculateWindowHeight();
  listenNewsletterFocus();

  window.addEventListener("resize", calculateWindowHeight());
});
