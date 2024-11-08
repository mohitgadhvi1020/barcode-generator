// public/js/main.js
$(document).ready(function () {
  // Initial load of QR codes
  QRManager.loadQRCodes();

  // Generate new QR code
  $(".generate-btn").click(function () {
    const name = $("#qr-name").val().trim();
    const url = $("#qr-url").val().trim();

    // Clear previous messages
    $(".error, .success").text("");

    // Validate inputs
    if (!name || !url) {
      UIManager.showError("Please enter both name and URL");
      return;
    }

    if (!Utils.validateUrl(url)) {
      UIManager.showError("Please enter a valid URL");
      return;
    }

    QRManager.createNewQR(name, url);
  });

  // Handle ESC key to close all dropdowns and update sections
  $(document).keyup(function (e) {
    if (e.key === "Escape") {
      UIManager.hideAllDropdowns();
      $(".update-url-section").slideUp();
    }
  });
});
