export function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function xmlAttrs(attrs: Record<string, string | number | undefined>) {
  return Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => ` ${key}="${escapeXml(String(value))}"`)
    .join("");
}

export function xmlTag(
  name: string,
  inner: string,
  attrs?: Record<string, string | number | undefined>,
) {
  return `<${name}${xmlAttrs(attrs ?? {})}>${inner}</${name}>`;
}

export function xmlText(
  name: string,
  text: string | number | null | undefined,
  attrs?: Record<string, string | number | undefined>,
) {
  if (text === null || text === undefined || text === "") return "";
  return xmlTag(name, escapeXml(String(text)), attrs);
}
