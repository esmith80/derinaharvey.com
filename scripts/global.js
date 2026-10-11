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
    "PT"  // Portugal
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
     * Remove any existing copy so we always
     * create a clean popup in the current body.
     */
    const existingOverlay =
      document.getElementById(
        "shippingRestrictionOverlay"
      );

    if (existingOverlay) {
      existingOverlay.remove();
    }


    const modalMessage = `
      <div id="shippingRestrictionOverlay">
        <div id="shippingRestrictionModal">

          <h2>Shipping Notice</h2>

          <p>
            Hi there! It looks like you're visiting from
            <span id="shippingCountryName"></span>.
          </p>

          <p>
            We're happy to help with your order, but for your country, we need you to contact us for a custom shipping quote via private courier.
          </p>

          <a
            id="shippingContactButton"
            href="/custom-shipping-quote"
          >
            Get Shipping Quote
          </a>

          <button
            id="shippingRestrictionClose"
            type="button"
          >
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
      document.getElementById(
        "shippingRestrictionOverlay"
      );

    const countryNameElement =
      document.getElementById(
        "shippingCountryName"
      );

    const closeButton =
      document.getElementById(
        "shippingRestrictionClose"
      );


    countryNameElement.textContent = countryName;


    closeButton.addEventListener("click", () => {
      modalOverlay.style.display = "none";
    });


    return modalOverlay;
  }


  /*
   * ========================================
   * SHOW POPUP
   * ========================================
   */

  function showShippingRestriction(countryName) {
    /*
     * Get the popup from the CURRENT page.
     *
     * Bandzoogle/Turbo may have replaced the body
     * since the last time checkout was clicked.
     */
    let modalOverlay =
      document.getElementById(
        "shippingRestrictionOverlay"
      );


    /*
     * If Turbo removed the old popup during
     * navigation, create a new one in the
     * current body.
     */
    if (!modalOverlay) {
      modalOverlay = createPopup(countryName);
    }


    modalOverlay.style.display = "flex";
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
     * Leave checkout completely alone.
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
          event.target.closest(
            "a[href='/go/cart']"
          );


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
        showShippingRestriction(country.name);
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