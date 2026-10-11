(() => {
  const GEOAPIFY_API_KEY = "1acd8c447fbd4c9ebfd17796a71e7b24";

  const form = document.getElementById("form_885398");

  if (!form) {
    return;
  }

  const addressLabel = [...form.querySelectorAll("label")].find(
    (label) => label.textContent.trim() === "Address"
  );

  if (!addressLabel) {
    return;
  }

  const addressInput = document.getElementById(addressLabel.htmlFor);

  if (!addressInput || addressInput.dataset.autocompleteInitialized) {
    return;
  }

  addressInput.dataset.autocompleteInitialized = "true";

  console.log("Shipping address autocomplete initialized");
})();