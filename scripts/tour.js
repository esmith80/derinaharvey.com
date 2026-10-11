function removeTimesFromMainListing() {
  const upcomingSection = document.querySelector("section.upcoming");

  if (upcomingSection) {
    upcomingSection
      .querySelectorAll("span.date-long, span.date-short")
      .forEach((span) => {
        span.textContent = span.textContent.replace(/\s*@.*$/, "").trim();
      });
  }
}

// Remove branding prefix from titles
function cleanUpEventTitle(el) {
  el.textContent = el.textContent.replace(/^Derina Harvey Band @\s*/, "");
}

// turn URLs, email addresses, and phone numbers in tour listings to clickable links
function transformTextToLinks(notes) {
  let html = notes.innerHTML;

  // Skip transforming any text already inside an <a> tag
  if (html.includes("<a")) return;

  // Convert plain URLs
  html = html.replace(
    /(?<!["'>])(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  // Convert email addresses
  html = html.replace(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    (match) => `<a href="mailto:${match}">${match}</a>`,
  );

  // Convert phone numbers
  html = html.replace(
    /(?:\+?\d{1,2}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}\b/g,
    (match) => {
      const tel = match.replace(/[^\d+]/g, "");
      return `<a href="tel:${tel}">${match}</a>`;
    },
  );

  notes.innerHTML = html;
}

// Clean up time display if it says "TBA" or "TBD"
function cleanUpTimeBlock(descEl) {
  const notes = descEl.querySelector(".event-notes");
  if (!notes || !/Time\s*[:\-]\s*tba?/i.test(notes.textContent)) return;

  descEl.querySelectorAll("time.from").forEach((timeEl) => {
    const timeSpan = timeEl.querySelector(".time");
    if (timeSpan) timeSpan.remove();

    Array.from(timeEl.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.includes("@")) {
        node.textContent = node.textContent.replace(/\s*@\s*/, " @ TBD");
      }
    });
  });
}

// Main per-event cleanup function
function cleanUpEventBlock(descEl) {
  const notes = descEl.querySelector(".event-notes");
  if (notes) transformTextToLinks(notes);
  cleanUpTimeBlock(descEl);
}

// Top-level cleanup function
function cleanUpEvents() {
  // Clean up all titles
  document.querySelectorAll("h2.heading-tertiary, span.event-name, a.event_details span").forEach(cleanUpEventTitle);

  // Clean up all descriptions
  document.querySelectorAll(".event-description").forEach(cleanUpEventBlock);
}

// Clean up times
removeTimesFromMainListing();

// Mutation trigger logic
let lastSnapshot = "";

function cleanUpEventsIfChanged() {
  const detailsModalOn = document.querySelector(".solo-event-occurrence");
  const container = detailsModalOn
    ? document.querySelector(".event-title")
    : document.querySelector(".event-name");

  if (!container) return;

  const currentSnapshot = container.innerHTML;
  if (currentSnapshot !== lastSnapshot) {
    lastSnapshot = currentSnapshot;
    cleanUpEvents();
  }
}

// Initialize cleanup
document.addEventListener("DOMContentLoaded", cleanUpEvents);
setInterval(cleanUpEventsIfChanged, 250);
