export default function truncateText(text, charLimit) {
  const truncatedText =
    text.length > charLimit ? text.substring(0, charLimit) + "..." : text;
  return truncatedText;
}
