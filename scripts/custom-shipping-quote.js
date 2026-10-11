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

  let debounceTimer;

  addressInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);

    const query = addressInput.value.trim();

    if (query.length < 3) {
      return;
    }

    debounceTimer = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
  });

  async function fetchSuggestions(query) {
    const url =
      "https://api.geoapify.com/v1/geocode/autocomplete" +
      `?text=${encodeURIComponent(query)}` +
      `&limit=5` +
      `&format=json` +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Geoapify returned ${response.status}`
        );
      }

      const data = await response.json();

      console.log("Geoapify suggestions:", data.results);
    } catch (error) {
      console.warn(
        "Address autocomplete failed:",
        error
      );
    }
  }

  console.log("Shipping address autocomplete initialized");
})();