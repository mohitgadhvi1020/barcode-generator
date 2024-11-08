// public/js/uiManager.js
const UIManager = {
  showLoading: function () {
    $(".qr-grid").html('<div class="loading">Loading QR codes...</div>');
  },

  setLoading: function (isLoading) {
    $(".generate-btn")
      .prop("disabled", isLoading)
      .html(
        isLoading
          ? '<i class="fas fa-spinner fa-spin"></i> Generating...'
          : '<i class="fas fa-plus"></i> Generate QR Code'
      );
  },

  clearInputs: function () {
    $("#qr-name, #qr-url").val("");
  },

  showError: function (message, id = "") {
    const errorElement = id ? $(`.error-${id}`) : $(".error");
    errorElement.text(message).fadeIn();
    setTimeout(() => errorElement.fadeOut(), 5000);
  },

  showSuccess: function (message, id = "") {
    const successElement = id ? $(`.success-${id}`) : $(".success");
    successElement.text(message).fadeIn();
    setTimeout(() => successElement.fadeOut(), 5000);
  },

  displayQRCodes: function (qrCodes) {
    const grid = $(".qr-grid");
    grid.empty();

    if (qrCodes.length === 0) {
      grid.html(
        '<div class="loading">No QR codes yet. Create your first one!</div>'
      );
      return;
    }

    qrCodes.reverse().forEach((qr) => {
      $.ajax({
        url: "/generate-dynamic-qr",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          url: qr.destinationUrl,
          id: qr.id,
          name: qr.name,
        }),
        success: function (response) {
          grid.append(
            this.createQRCard({
              ...qr,
              qrCode: response.qrCode,
            })
          );
        }.bind(this),
        error: function (error) {
          console.error("Error loading QR code:", error);
        },
      });
    });
  },

  createQRCard: function (qr) {
    const scanCount = qr.scans ? qr.scans.length : 0;
    const lastScan =
      qr.scans && qr.scans.length > 0
        ? new Date(qr.scans[qr.scans.length - 1].timestamp).toLocaleString()
        : "Never";

    return `
            <div class="qr-card" data-id="${qr.id}">
                <div class="qr-name">${Utils.escapeHtml(qr.name)}</div>
                
                <img src="${qr.qrCode}" alt="QR Code for ${Utils.escapeHtml(
      qr.name
    )}">
                
                <div class="qr-info">
                    <strong>Destination URL:</strong><br>
                    <a href="${qr.destinationUrl}" target="_blank">
                        ${Utils.escapeHtml(qr.destinationUrl)}
                    </a>
                </div>
                
                <div class="qr-stats">
                    <strong>Total Scans:</strong> ${scanCount}<br>
                    <strong>Last Scan:</strong> ${lastScan}
                </div>
                
                <div class="btn-group">
                    <!-- Download Options -->
                    <div class="download-dropdown">
                        <button class="btn download-btn" onclick="UIManager.toggleDownloadMenu('${
                          qr.id
                        }')">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <div class="download-menu" id="download-menu-${qr.id}">
                            <button onclick="QRManager.downloadQR('${
                              qr.qrCode
                            }', '${qr.name}', 'png')">
                                <i class="fas fa-file-image"></i> Download PNG
                            </button>
                            <button onclick="QRManager.downloadQR('${
                              qr.qrCode
                            }', '${qr.name}', 'svg')">
                                <i class="fas fa-file-code"></i> Download SVG
                            </button>
                            <button onclick="QRManager.downloadQR('${
                              qr.qrCode
                            }', '${qr.name}', 'pdf')">
                                <i class="fas fa-file-pdf"></i> Download PDF
                            </button>
                        </div>
                    </div>

                    <!-- Update URL Button -->
                    <button class="btn update-btn" onclick="UIManager.toggleUpdateSection('${
                      qr.id
                    }')">
                        <i class="fas fa-edit"></i> Update URL
                    </button>

                    <!-- Delete Button -->
                    <button class="btn delete-btn" onclick="QRManager.deleteQR('${
                      qr.id
                    }')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>

                <!-- Update URL Section (Hidden by default) -->
                <div class="update-url-section" id="update-section-${
                  qr.id
                }" style="display: none;">
                    <div class="input-group">
                        <input type="url" class="update-url-input" placeholder="Enter new URL">
                        <div class="btn-group">
                            <button class="btn btn-success" onclick="QRManager.updateUrl('${
                              qr.id
                            }')">
                                <i class="fas fa-save"></i> Save
                            </button>
                            <button class="btn btn-secondary" onclick="UIManager.toggleUpdateSection('${
                              qr.id
                            }')">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Message Display -->
                <div class="error-${qr.id} error"></div>
                <div class="success-${qr.id} success"></div>
            </div>
        `;
  },

  toggleDownloadMenu: function (id) {
    const menu = $(`#download-menu-${id}`);
    $(".download-menu").not(menu).slideUp(); // Close other menus
    menu.slideToggle();
  },

  toggleUpdateSection: function (id) {
    const section = $(`#update-section-${id}`);
    section.slideToggle();
    if (section.is(":visible")) {
      section.find(".update-url-input").focus();
    }
  },

  hideAllDropdowns: function () {
    $(".download-menu").slideUp();
  },

  // Initialize UI events
  init: function () {
    // Close dropdowns when clicking outside
    $(document).click(function (event) {
      if (!$(event.target).closest(".download-dropdown").length) {
        UIManager.hideAllDropdowns();
      }
    });

    // Handle enter key in inputs
    $("#qr-name, #qr-url").keypress(function (e) {
      if (e.which === 13) {
        $(".generate-btn").click();
      }
    });
  },
};

// Initialize UI when document is ready
$(document).ready(function () {
  UIManager.init();
});
