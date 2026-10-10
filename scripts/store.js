const html = `
  <div id="shippingRestrictionOverlay">
    <div id="shippingRestrictionModal">
      <h2>Shipping Notice</h2>

      <p>
        Canada Post has temporarily suspended parcel service to
        <span id="shippingCountryName">your country</span>.
      </p>

      <p>
        We'd still be happy to help with your order! Please contact us
        for a custom shipping quote via private courier.
      </p>

      <a id="shippingContactButton" href="/contact">
        Contact Us
      </a>

      <button id="shippingRestrictionClose">Close</button>
    </div>
  </div>
`;

document.body.insertAdjacentHTML("beforeend", html);

const displayPopup = true;
const hoursUntilNextPopup = 0;
const oneDay = hoursUntilNextPopup * 60 * 60 * 1000;

const lastSeen = localStorage.getItem("popupSeenTime");

if (displayPopup && (!lastSeen || Date.now() - lastSeen > oneDay)) {
  const modal = document.getElementById("pop-up-alert");
  const closeButton = document.getElementById("pop-up-alert-close");

  window.addEventListener("load", () => {
    modal.showModal();
  });

  closeButton.addEventListener("click", () => {
    modal.close();
    localStorage.setItem("popupSeenTime", Date.now());
  });
}

console.log("Hi from Github! store.js just loaded")
