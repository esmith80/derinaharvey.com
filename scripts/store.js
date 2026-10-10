(() => {
  const modalMessage = `
  <dialog id="pop-up-alert">
    <p><strong>SHIPPING NOTICE</strong></p>
    <p>Canada Post has temporarily suspended parcel services to select destinations.</p>
    <p>As a result, I cannot use Canada Post to ship orders to the following countries: Austria, Belgium, Czech Republic, Denmark, Finland, France, Germany, Luxembourg, Portugal</p>
    <p>If you are trying to ship to one of those countries, please <a href="/contact">contact us</a> and we will get you a shipping quote. Apologies for the inconvenience, please know that I appreciate your interest in dHb’s music and products! Thanks for your support!<br><br>
    - Derina</p>
  <button id="pop-up-alert-close">Close</button>
</dialog>
`;

  document.body.insertAdjacentHTML("beforeend", modalMessage);

  const displayPopup = true;
  const hoursUntilNextPopup = 0;
  const oneDay = hoursUntilNextPopup * 60 * 60 * 1000;

  const lastSeen = localStorage.getItem("popupSeenTime");

  if (displayPopup && (!lastSeen || Date.now() - lastSeen > oneDay)) {
    const modal = document.getElementById("pop-up-alert");
    const closeButton = document.getElementById("pop-up-alert-close");

    modal.showModal();

    closeButton.addEventListener("click", () => {
      modal.close();
      localStorage.setItem("popupSeenTime", Date.now());
    });
  }
})();
