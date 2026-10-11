(() => {
  const GEOAPIFY_API_KEY = "1acd8c447fbd4c9ebfd17796a71e7b24";

  const form = document.querySelector(
    ".custom_form_feature form.custom_form"
  );

  if (!form) {
    return;
  }

  const addressLabel = [...form.querySelectorAll("label")].find(
    (label) => label.textContent.trim() === "Shipping Address"
  );

  if (!addressLabel) {
    return;
  }

  const addressInput = document.getElementById(
    addressLabel.htmlFor
  );

  if (!addressInput) {
    return;
  }

  // Prevent duplicate initialization if Bandzoogle/Turbo
  // executes this script more than once on the same form.
  if (addressInput.dataset.autocompleteInitialized === "true") {
    return;
  }

  addressInput.dataset.autocompleteInitialized = "true";

  // -------------------------
  // Build autocomplete UI
  // -------------------------

  const autocomplete = document.createElement("div");
  autocomplete.className = "address-autocomplete";

  const attribution = document.createElement("div");
  attribution.className = "address-autocomplete-attribution";
  attribution.innerHTML = `
    Powered by
    <a
      href="https://www.geoapify.com/"
      target="_blank"
      rel="noopener"
    >Geoapify</a>
    · ©
    <a
      href="https://www.openstreetmap.org/copyright"
      target="_blank"
      rel="noopener"
    >OpenStreetMap contributors</a>
  `;

  addressInput.parentElement.appendChild(autocomplete);
  addressInput.parentElement.appendChild(attribution);

  // -------------------------
  // State
  // -------------------------

  let debounceTimer;
  let activeIndex = -1;
  let requestNumber = 0;

  // -------------------------
  // Input
  // -------------------------

  addressInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);

    const query = addressInput.value.trim();

    activeIndex = -1;

    if (query.length < 3) {
      // Invalidates any request already in progress.
      requestNumber++;
      clearSuggestions();
      return;
    }

    debounceTimer = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
  });

  // -------------------------
  // Geoapify
  // -------------------------

  async function fetchSuggestions(query) {
    const thisRequest = ++requestNumber;

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

      // Ignore this response if a newer request has
      // already been started.
      if (thisRequest !== requestNumber) {
        return;
      }

      displaySuggestions(data.results || []);
    } catch (error) {
      // Don't let an old failed request clear newer results.
      if (thisRequest !== requestNumber) {
        return;
      }

      console.warn(
        "Address autocomplete failed:",
        error
      );

      clearSuggestions();
    }
  }

  // -------------------------
  // Suggestions
  // -------------------------

  function displaySuggestions(results) {
    clearSuggestions();

    results.forEach((result) => {
      if (!result.formatted) {
        return;
      }

      const suggestion = document.createElement("button");

      suggestion.type = "button";
      suggestion.className =
        "address-autocomplete-suggestion";

      suggestion.textContent = result.formatted;

      suggestion.addEventListener("click", () => {
        selectSuggestion(result.formatted);
      });

      autocomplete.appendChild(suggestion);
    });

    activeIndex = -1;
  }

  function selectSuggestion(address) {
    addressInput.value = address;

    clearSuggestions();

    addressInput.focus();
  }

  function clearSuggestions() {
    autocomplete.innerHTML = "";
    activeIndex = -1;
  }

  // -------------------------
  // Keyboard navigation
  // -------------------------

  addressInput.addEventListener("keydown", (event) => {
    const suggestions = getSuggestions();

    if (!suggestions.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      activeIndex++;

      if (activeIndex >= suggestions.length) {
        activeIndex = 0;
      }

      updateActiveSuggestion(suggestions);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      activeIndex--;

      if (activeIndex < 0) {
        activeIndex = suggestions.length - 1;
      }

      updateActiveSuggestion(suggestions);
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();

      suggestions[activeIndex].click();
    }

    if (event.key === "Escape") {
      clearSuggestions();
    }
  });

  function getSuggestions() {
    return [
      ...autocomplete.querySelectorAll(
        ".address-autocomplete-suggestion"
      )
    ];
  }

  function updateActiveSuggestion(suggestions) {
    suggestions.forEach((suggestion, index) => {
      suggestion.classList.toggle(
        "active",
        index === activeIndex
      );
    });

    if (activeIndex >= 0) {
      suggestions[activeIndex].scrollIntoView({
        block: "nearest"
      });
    }
  }

  // -------------------------
  // Close when clicking away
  // -------------------------

  document.addEventListener("click", (event) => {
    if (
      event.target !== addressInput &&
      !autocomplete.contains(event.target)
    ) {
      clearSuggestions();
    }
  });
})();