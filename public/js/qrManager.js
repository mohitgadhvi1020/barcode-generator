const QRManager = {
  loadQRCodes: function () {
    UIManager.showLoading();
    $.get("/qr-codes")
      .done(function (qrCodes) {
        UIManager.displayQRCodes(qrCodes);
      })
      .fail(function () {
        UIManager.showError("Failed to load QR codes");
      });
  },

  createNewQR: function (name, url) {
    UIManager.setLoading(true);
    $.ajax({
      url: "/generate-dynamic-qr",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ name, url }),
      success: function (response) {
        UIManager.showSuccess("QR code generated successfully!");
        UIManager.clearInputs();
        this.loadQRCodes();
      }.bind(this),
      error: function (xhr) {
        UIManager.showError(
          xhr.responseJSON?.error || "Error generating QR code"
        );
      },
      complete: function () {
        UIManager.setLoading(false);
      },
    });
  },

  updateUrl: function (id) {
    const newUrl = $(`.qr-card[data-id="${id}"] .update-url-input`)
      .val()
      .trim();

    if (!Utils.validateUrl(newUrl)) {
      UIManager.showError("Please enter a valid URL", id);
      return;
    }

    $.ajax({
      url: `/update-url/${id}`,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify({ newUrl }),
      success: function (response) {
        UIManager.showSuccess("URL updated successfully!", id);
        this.loadQRCodes();
      }.bind(this),
      error: function (xhr) {
        UIManager.showError(
          xhr.responseJSON?.error || "Error updating URL",
          id
        );
      },
    });
  },

  deleteQR: function (id) {
    if (!confirm("Are you sure you want to delete this QR code?")) return;

    $.ajax({
      url: `/qr-code/${id}`,
      method: "DELETE",
      success: function (response) {
        UIManager.showSuccess("QR code deleted successfully!");
        this.loadQRCodes();
      }.bind(this),
      error: function () {
        UIManager.showError("Error deleting QR code");
      },
    });
  },

  downloadQR: function (qrCode, name, format = "png") {
    const fileName = Utils.sanitizeFileName(name);

    switch (format) {
      case "png":
        this.downloadAsPNG(qrCode, fileName);
        break;
      case "svg":
        this.downloadAsSVG(qrCode, fileName);
        break;
      case "pdf":
        this.downloadAsPDF(qrCode, fileName, name);
        break;
    }
  },

  downloadAsPNG: function (dataUrl, fileName) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${fileName}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    UIManager.showSuccess("QR code downloaded successfully!");
  },

  downloadAsSVG: function (qrCode, fileName) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const svgString = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
                    <image href="${qrCode}" width="${canvas.width}" height="${canvas.height}"/>
                </svg>
            `;

      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}-qr.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      UIManager.showSuccess("QR code downloaded successfully!");
    };
    img.src = qrCode;
  },

  downloadAsPDF: function (qrCode, fileName, originalName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(originalName, 105, 20, { align: "center" });

    const img = new Image();
    img.onload = function () {
      const imgProps = doc.getImageProperties(qrCode);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      doc.addImage(qrCode, "PNG", 10, 30, pdfWidth - 20, pdfWidth - 20);
      doc.save(`${fileName}-qr.pdf`);
      UIManager.showSuccess("QR code downloaded successfully!");
    };
    img.src = qrCode;
  },
};
