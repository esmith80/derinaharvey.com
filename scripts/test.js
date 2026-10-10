(() => {
  console.log("test.js started");

  const html = `
    <dialog id="pop-up-alert">
      <p>Test popup</p>
      <button id="pop-up-alert-close">Close</button>
    </dialog>
  `;

  console.log("HTML created");

  document.body.insertAdjacentHTML("beforeend", html);

  console.log("HTML inserted");

  const modal = document.getElementById("pop-up-alert");

  console.log("Modal:", modal);

  modal.showModal();

  console.log("Modal shown");
})();