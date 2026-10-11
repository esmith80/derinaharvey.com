(() => {
const modalMessage = `
  <dialog id="pop-up-alert">
    <p><strong>SHIPPING NOTICE</strong></p>

    <p>
      Canada Post has temporarily suspended parcel service to several international destinations, including:
    </p>

    <p>
      <strong>Austria, Belgium, Czech Republic, Denmark, Finland, France, Germany, Luxembourg, and Portugal.</strong>
    </p>

    <p>
      Shipping to one of these countries? We may still be able to ship your order using a private courier.
    </p>

    <p>
      Please <a href="/custom-shipping-quote">contact us</a> for a shipping quote, or
      <a href="/shipping-policy">read our shipping policy</a> for more information.
    </p>

    <p>Thanks for your understanding and support!<br>— Derina</p>

    <button id="pop-up-alert-close">Close</button>
  </dialog>
`;

const existingModal = document.getElementById("pop-up-alert");

if (existingModal) {
  existingModal.remove();
}

document.body.insertAdjacentHTML("beforeend", modalMessage);

  const displayPopup = true;
  const hoursUntilNextPopup = 24;
  const timeToShowAgain = hoursUntilNextPopup * 60 * 60 * 1000;

  const lastSeen = localStorage.getItem("popupSeenTime");

  if (displayPopup && (!lastSeen || Date.now() - lastSeen > timeToShowAgain)) {
    const modal = document.getElementById("pop-up-alert");
    const closeButton = document.getElementById("pop-up-alert-close");

    modal.showModal();

    closeButton.addEventListener("click", () => {
      modal.close();
      localStorage.setItem("popupSeenTime", Date.now());
    });
  }
})();
