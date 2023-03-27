const MARKETO_FORMS = ["4727"];

function getActiveMarketoForms() {
  const ids = MARKETO_FORMS.map((id) => `#mktoForm_${id}`);
  const $forms = Array.prototype.slice.call(
    document.querySelectorAll(ids.join(","))
  );
  return $forms.map(($form) => $form.id);
}

function loadMarketo(callback) {
  if (window.MktoForms2) {
    callback && callback();
    return;
  }

  let attempts = 0;
  const loader = setInterval(() => {
    if (window.MktoForms2) {
      callback && callback();
      clearInterval(loader);
      return;
    }

    if (attempts === 10) {
      clearInterval(loader);
      console.log("couldn't load MktoForms2");
      return;
    }

    attempts++;
  }, 1000);
}

function loadForm(id, callback) {
  try {
    MktoForms2.loadForm("//pages.datastax.com", "259-IFZ-779", id, callback);
  } catch (error) {
    console.log("Error loading marketo form");
  }
}

function initializeNewsletter(form) {
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
}

export function loadMarketoForms() {
  const activeForms = getActiveMarketoForms();

  if (activeForms) {
    loadMarketo(() => {
      activeForms.forEach((formId) => {
        const id = parseInt(formId.replace(`mktoForm_`, ""));
        const callbacks = {
          4727: initializeNewsletter,
        };
        let callback = callbacks[id] || undefined;

        loadForm(id, callback);
      });
    });
  }
}
