// utils/urlValidator.js
const validateUrl = async (url) => {
  try {
    const parsedUrl = new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = { validateUrl };
