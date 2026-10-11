 (() => {
  const GEOAPIFY_API_KEY = "1acd8c447fbd4c9ebfd17796a71e7b24";

  const form = document.getElementById("form_885398");

  if (!form) {
    return;
  }

  const addressLabel = [...form.querySelectorAll("label")].find(
    (label) => label.textContent.trim() === "Shipping Address"
  );

  if (!addressLabel) {
    return;
  }

  const addressInput = document.getElementById(addressLabel.htmlFor);

  if (!addressInput || addressInput.dataset.autocompleteInitialized) {
    return;
  }

  addressInput.dataset.autocompleteInitialized = "true";

  // Create autocomplete container
  const autocomplete = document.createElement("div");
  autocomplete.className = "address-autocomplete";

  addressInput.parentElement.appendChild(autocomplete);

  // Create attribution
  const attribution = document.createElement("div");
  attribution.className = "address-autocomplete-attribution";
  attribution.innerHTML = `
    Powered by
    <a href="https://www.geoapify.com/" target="_blank" rel="noopener">
      Geoapify
    </a>
    · ©
    <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">
      OpenStreetMap contributors
    </a>
  `;

  addressInput.parentElement.appendChild(attribution);

  let debounceTimer;

  addressInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);

    const query = addressInput.value.trim();

    if (query.length < 3) {
      clearSuggestions();
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

      displaySuggestions(data.results || []);
    } catch (error) {
      console.warn(
        "Address autocomplete failed:",
        error
      );

      clearSuggestions();
    }
  }

  function displaySuggestions(results) {
    clearSuggestions();

    results.forEach((result) => {
      const suggestion = document.createElement("button");

      suggestion.type = "button";
      suggestion.className = "address-autocomplete-suggestion";
      suggestion.textContent = result.formatted;

      suggestion.addEventListener("click", () => {
        addressInput.value = result.formatted;
        clearSuggestions();
        addressInput.focus();
      });

      autocomplete.appendChild(suggestion);
    });
  }

  function clearSuggestions() {
    autocomplete.innerHTML = "";
  }

  // Close suggestions when clicking elsewhere.
  document.addEventListener("click", (event) => {
    if (
      event.target !== addressInput &&
      !autocomplete.contains(event.target)
    ) {
      clearSuggestions();
    }
  });
})();