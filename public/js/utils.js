const Utils = {
  escapeHtml: function (unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  validateUrl: function (url) {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  },

  formatDate: function (date) {
    return date ? new Date(date).toLocaleString() : "Never";
  },

  sanitizeFileName: function (name) {
    return name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  },
};
