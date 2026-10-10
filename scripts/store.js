() => {
  console.log("store.js starting", new Date().toISOString());
  console.count("store.js execution count");

  const modalMessage = `
<dialog id="pop-up-alert">
  <img src="https://derinaharvey.com/files/194581/high-res-logo.jpg" width="100">
  <p><strong>**NOTICE**</strong></p>
  <p>Canada Post has temporarily suspended parcel services to select destinations.</p>
  <p>As a result, I cannot currently ship orders to the following countries: Austria, Belgium, Czech Republic, Denmark, Finland, France, Germany, Luxembourg, Portugal</p>
  <p>I am closely tracking updates from the Canada Post <a target="_blank" href="https://www.canadapost-postescanada.ca/cpc/en/our-company/news-and-media/service-alerts.page">Delivery Service Disruptions Page</a>. I apologize if these changes have led to  any inconvenience. I appreciate your interest in dHb’s music and products and thank you for your continued support!<br><br>

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

    window.addEventListener("load", () => {
      modal.showModal();
    });

    closeButton.addEventListener("click", () => {
      modal.close();
      localStorage.setItem("popupSeenTime", Date.now());
    });
  }

  console.log("Hi from Github! store.js just loaded");
};
