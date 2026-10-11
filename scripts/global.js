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


    countryNameElement.textContent = countryName;


    return modalOverlay;
  }


  /*
   * ========================================
   * SHOW POPUP
   * ========================================
   */

  function showShippingRestriction(countryName) {
    let modalOverlay =
      document.getElementById(
        "shippingRestrictionOverlay"
      );


    /*
     * Bandzoogle/Turbo may have replaced the body.
     * If so, create the popup again.
     */
    if (!modalOverlay) {
      modalOverlay = createPopup(countryName);
    }


    modalOverlay.style.display = "flex";
  }


  /*
   * ========================================
   * HIDE POPUP
   * ========================================
   */

  function hideShippingRestriction() {
    const modalOverlay =
      document.getElementById(
        "shippingRestrictionOverlay"
      );

    if (modalOverlay) {
      modalOverlay.style.display = "none";
    }
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
     * DELEGATED CLICK HANDLING
     * ========================================
     *
     * We handle both checkout and popup controls
     * at the document level.
     *
     * This survives Bandzoogle replacing/restoring
     * individual DOM elements.
     */
    document.addEventListener(
      "click",
      (event) => {

        /*
         * ----------------------------
         * CLOSE POPUP
         * ----------------------------
         */

        const closeButton =
          event.target.closest(
            "#shippingRestrictionClose"
          );

        if (closeButton) {
          event.preventDefault();

          hideShippingRestriction();

          return;
        }


        /*
         * ----------------------------
         * GET SHIPPING QUOTE
         * ----------------------------
         *
         * Hide the popup before navigating away.
         * This prevents Turbo from saving a
         * snapshot with the popup still visible.
         */

        const contactButton =
          event.target.closest(
            "#shippingContactButton"
          );

        if (contactButton) {
          hideShippingRestriction();

          /*
           * Don't preventDefault().
           *
           * Let Bandzoogle follow the link normally.
           */
          return;
        }


        /*
         * ----------------------------
         * CHECKOUT
         * ----------------------------
         */

        const checkoutLink =
          event.target.closest(
            "a[href='/go/cart']"
          );

        if (!checkoutLink) {
          return;
        }


        console.log(
          `Checkout clicked. Preventing checkout for ${country.name}.`
        );


        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();


        showShippingRestriction(country.name);
      },

      /*
       * Capture phase lets us intercept checkout
       * before Bandzoogle's handlers.
       */
      true
    );
  }


  initializeShippingRestrictions();

})();