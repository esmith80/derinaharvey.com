(() => {
  // -------------------------
  // Configuration
  // -------------------------

  const COUNTRY_MAP = {
    canada: "CAN",
    "united states": "USA"
  };

  const ARTIST = "Derina Harvey Band";
  const APP_ID = "917334f106a4bda4f1e090a5092fcb03";
  const EARLIEST_DATE = "2016-01-01";

  // -------------------------
  // Initialize
  // -------------------------

  function initialize() {
    const pastShows = document.querySelector(".past-shows");

    // Bandzoogle may execute this script before the
    // HTML widget has been added to the DOM.
    if (!pastShows) {
      return false;
    }

    // Prevent initializing the same widget twice.
    if (pastShows.dataset.initialized === "true") {
      return true;
    }

    const yearFilter = pastShows.querySelector(
      "#past-shows-year-filter"
    );

    const searchInput = pastShows.querySelector(
      "#past-shows-search"
    );

    const eventCount = pastShows.querySelector(
      "#past-shows-event-count"
    );

    const eventsContainer = pastShows.querySelector(
      "#past-shows-events-container"
    );

    // Make sure all required elements exist before
    // marking the feature as initialized.
    if (
      !yearFilter ||
      !searchInput ||
      !eventCount ||
      !eventsContainer
    ) {
      return false;
    }

    pastShows.dataset.initialized = "true";

    let allEvents = [];

    // -------------------------
    // Date range
    // -------------------------

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayString =
      yesterday.toLocaleDateString("en-CA");

    const dateRange =
      `${EARLIEST_DATE},${yesterdayString}`;

    // -------------------------
    // Load events
    // -------------------------

    async function loadEvents() {
      const artist = encodeURIComponent(ARTIST);

      const url =
        `https://rest.bandsintown.com/artists/${artist}/events` +
        `?app_id=${APP_ID}` +
        `&date=${dateRange}`;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Bandsintown returned ${response.status}`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            "Bandsintown returned unexpected data."
          );
        }

        allEvents = data;

        prepareEvents();
        buildYearFilter();
        setDefaultYear();
        applyFilters();
      } catch (error) {
        console.warn(
          "Past shows archive failed to load:",
          error
        );

        eventCount.textContent = "";

        eventsContainer.textContent =
          "Past shows are temporarily unavailable.";
      }
    }

    // -------------------------
    // Prepare event data
    // -------------------------

    function prepareEvents() {
      allEvents.forEach((event) => {
        event.venue = event.venue || {};

        const country =
          (event.venue.country || "").toLowerCase();

        event.venue.countryCode =
          COUNTRY_MAP[country] || "";
      });

      allEvents.sort(
        (a, b) =>
          new Date(b.datetime) - new Date(a.datetime)
      );
    }

    // -------------------------
    // Build year filter
    // -------------------------

    function buildYearFilter() {
      const counts = {};

      allEvents.forEach((event) => {
        const year =
          new Date(event.datetime).getFullYear();

        counts[year] = (counts[year] || 0) + 1;
      });

      Object.keys(counts)
        .map(Number)
        .sort((a, b) => b - a)
        .forEach((year) => {
          const option =
            document.createElement("option");

          option.value = year;
          option.textContent =
            `${year} (${counts[year]})`;

          yearFilter.appendChild(option);
        });
    }

    // -------------------------
    // Default year
    // -------------------------

    function setDefaultYear() {
      const currentYear =
        new Date().getFullYear();

      const currentYearExists =
        [...yearFilter.options].some(
          (option) =>
            Number(option.value) === currentYear
        );

      if (currentYearExists) {
        yearFilter.value = currentYear;
      }
    }

    // -------------------------
    // Apply filters
    // -------------------------

    function applyFilters() {
      const selectedYear = yearFilter.value;

      const search =
        searchInput.value.trim().toLowerCase();

      let filteredEvents = [...allEvents];

      if (selectedYear !== "all") {
        filteredEvents = filteredEvents.filter(
          (event) =>
            new Date(event.datetime).getFullYear() ===
            Number(selectedYear)
        );
      }

      if (search) {
        filteredEvents = filteredEvents.filter(
          (event) => {
            const venue =
              (event.venue?.name || "").toLowerCase();

            const city =
              (event.venue?.city || "").toLowerCase();

            const region =
              (event.venue?.region || "").toLowerCase();

            const country =
              (event.venue?.country || "").toLowerCase();

            const countryCode =
              (event.venue?.countryCode || "")
                .toLowerCase();

            return (
              venue.includes(search) ||
              city.includes(search) ||
              region.includes(search) ||
              country.includes(search) ||
              countryCode.includes(search)
            );
          }
        );
      }

      render(filteredEvents);
    }

    // -------------------------
    // Render
    // -------------------------

    function render(events) {
      eventCount.textContent =
        `${events.length} show` +
        `${events.length === 1 ? "" : "s"}`;

      if (!events.length) {
        eventsContainer.textContent =
          "No matching events.";

        return;
      }

      const rows = events
        .map((event) => {
          const date =
            new Date(
              event.datetime
            ).toLocaleDateString("en-CA", {
              year: "numeric",
              month: "short",
              day: "numeric"
            });

          const venue =
            event.venue?.name || "";

          const location = [
            event.venue?.city,
            event.venue?.region,
            event.venue?.countryCode ||
              event.venue?.country
          ]
            .filter(Boolean)
            .join(", ");

          return `
            <tr>
              <td class="date-col">${date}</td>
              <td class="venue-col">${venue}</td>
              <td class="city-col">${location}</td>
            </tr>
          `;
        })
        .join("");

      eventsContainer.innerHTML = `
        <table class="events-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Venue</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    }

    // -------------------------
    // Event listeners
    // -------------------------

    yearFilter.addEventListener(
      "change",
      applyFilters
    );

    searchInput.addEventListener(
      "input",
      applyFilters
    );

    // -------------------------
    // Start feature
    // -------------------------

    loadEvents();

    return true;
  }

  // -------------------------
  // Bandzoogle DOM handling
  // -------------------------

  // On a normal page load, the HTML may already exist.
  if (initialize()) {
    return;
  }

  // If Bandzoogle hasn't inserted the HTML yet,
  // watch the DOM until it does.
  const observer = new MutationObserver(() => {
    if (initialize()) {
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();