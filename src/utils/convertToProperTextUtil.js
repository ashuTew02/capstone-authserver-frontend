/**
 * Converts a string with underscores to a properly formatted text string.
 * Each word is capitalized and underscores are replaced with spaces.
 *
 * @param {string} str - The input string to be converted.
 * @returns {string} The formatted string with spaces and capitalization.
 */

export default function convertTextFormat(str) {
  return str
    .split("_") // Split the string by underscores
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + // Convert first character to uppercase
        word.slice(1).toLowerCase() // Convert the rest to lowercase
    )
    .join(" "); // Join the words back with spaces
}
