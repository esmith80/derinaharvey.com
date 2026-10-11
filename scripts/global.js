(() => {
  /*
   * ========================================
   * SETTINGS
   * ========================================
   */

  const shippingRestrictionsEnabled = true;

  const blockedCountries = [
    "AT", // Austria
    "BE", // Belgium
    "CZ", // Czech Republic
    "DK", // Denmark
    "FI", // Finland
    "FR", // France
    "DE", // Germany
    "LU", // Luxembourg
    "PT" // Portugal
  ];


  /*
   * Stop immediately if feature is disabled.
   */
  if (!shippingRestrictionsEnabled) {
    console.log("Shipping restrictions disabled.");
    return;
  }


  /*
   * ========================================
   * COUNTRY LOOKUP
   * ========================================
   */

  async function getCountry() {
    try {
      const response = await fetch(
        "https://ipapi.co/json/",
        {
          cache: "no-cache"
        }
      );

      if (!response.ok) {
        throw new Error(
          "Location service returned " + response.status
        );
      }

      const data = await response.json();

      console.log(
        "Detected country:",
        data.country,
        data.country_name
      );

      return {
        code: data.country,
        name: data.country_name
      };

    } catch (error) {
      console.warn(
        "Location check failed:",
        error
      );

      /*
       * Fail open.
       *
       * If we cannot confidently determine the
       * visitor's country, don't interfere with checkout.
       */
      return null;
    }
  }


  /*
   * ========================================
   * POPUP
   * ========================================
   */

  function createPopup(countryName) {
    /*
     * Turbo may restore an old copy of the popup
     * when navigating through browser history.
     *
     * Remove it so we always start with a clean one.
     */
    const existingOverlay =
      document.getElementById("shippingRestrictionOverlay");

    if (existingOverlay) {
      existingOverlay.remove();
    }


    const modalMessage = `
      <div id="shippingRestrictionOverlay">
        <div id="shippingRestrictionModal">

          <h2>Shipping Notice</h2>

          <p>
            Hey! It looks like you're visiting from 
            <span id="shippingCountryName"></span>.
          </p>

          <p>
            We're happy to help with your order, but for your region, please contact us for a custom shipping quote via private courier.
          </p>

          <a id="shippingContactButton" href="/contact">
            Contact Us
          </a>

          <button id="shippingRestrictionClose">
            Close
          </button>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML(
      "beforeend",
      modalMessage
    );


    const modalOverlay =
      document.getElementById("shippingRestrictionOverlay");

    const countryNameElement =
      document.getElementById("shippingCountryName");

    const closeButton =
      document.getElementById("shippingRestrictionClose");


    countryNameElement.textContent = countryName;


    closeButton.addEventListener("click", () => {
      modalOverlay.style.display = "none";
    });


    return modalOverlay;
  }


  /*
   * ========================================
   * INITIALIZE
   * ========================================
   */

  async function initializeShippingRestrictions() {
    const country = await getCountry();


    /*
     * Location could not be confirmed.
     * Leave checkout completely alone.
     */
    if (!country) {
      console.log(
        "Country could not be determined. Checkout will not be restricted."
      );

      return;
    }


    /*
     * Visitor is not in an affected country.
     * Again, leave checkout completely alone.
     */
    if (!blockedCountries.includes(country.code)) {
      console.log(
        `${country.name} is not affected. Checkout will operate normally.`
      );

      return;
    }


    console.log(
      `Affected country detected: ${country.name}. Checkout interception enabled.`
    );


    /*
     * We only create the popup after confirming
     * that this visitor is affected.
     */
    const modalOverlay =
      createPopup(country.name);


    const showShippingRestriction = () => {
      modalOverlay.style.display = "flex";
    };


    /*
     * ========================================
     * INTERCEPT CHECKOUT
     * ========================================
     *
     * Use event delegation rather than attaching
     * listeners directly to Bandzoogle's checkout
     * buttons.
     *
     * This means Bandzoogle can create/recreate
     * the button and this will still work.
     */
    document.addEventListener(
      "click",
      (event) => {
        const checkoutLink =
          event.target.closest("a[href='/go/cart']");


        /*
         * Not a checkout click.
         */
        if (!checkoutLink) {
          return;
        }


        console.log(
          `Checkout clicked. Preventing checkout for ${country.name}.`
        );


        /*
         * Prevent Bandzoogle checkout.
         */
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();


        /*
         * Show our shipping message instead.
         */
        showShippingRestriction();
      },

      /*
       * Capture phase lets us intercept the click
       * before Bandzoogle's own click handlers.
       */
      true
    );
  }


  initializeShippingRestrictions();

})();