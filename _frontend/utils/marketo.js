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

  form.onValidate(function onValidate(isValid) {
    if (!isValid) {
      alert("Please fill all the required fields and try again.");
    }
  });

  form.onSuccess(function onSuccess() {
    const $status = document.querySelector("div[newsletter-status]");
    const $form = document.querySelector("form[newsletter-form]");

    $form.style.display = "none";
    $status.innerHTML = "<strong>Thanks for subscribing!</strong><br><span>The latest articles on all things data will be delivered straight to your inbox now.</span>";
    $("#newsletter-modal").modal("hide");
    

    // Disable redirection
    return false;
  })  
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

export function enableMarketoDebugger() {
  const $container = document.querySelector("div[blog-post-container]");
  const $contentCol = $container.querySelector("div[class=\"col-md-12\"]");
  const $newsletterCol = $container.querySelector("div[class=\"col-md-5 d-none\"]");
  $contentCol.classList.remove("col-md-12");
  $contentCol.classList.add("col-md-7");
  $newsletterCol.classList.remove("d-none");
}