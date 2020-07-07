/**
 * Formats the internal camelCase language tag as BCP 47
 * compliant (e. g. `en-GB`). Returns `en-GB` if the language is not set.
 */
export function languageTag(language) {
  if (language.length === 0 && !localStorage.language) return "en-GB";
  const lang = language ?? localStorage.language;

  const regex = new RegExp(/([A-Z]{1}[a-z]{1})/g);
  return lang.replace(regex, (match) => {
    return match.toUpperCase().padStart(match.length + 1, "-");
  });
}
