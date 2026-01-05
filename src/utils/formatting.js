function formatMemory(bytes) {
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB";
}

function escapeHTML(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

module.exports = { formatMemory, escapeHTML };
