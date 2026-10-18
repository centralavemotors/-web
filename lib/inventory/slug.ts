export function slugPart(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function vehicleSlug(input: {
  year: number;
  make: string;
  model: string;
  vin: string;
}) {
  return [String(input.year), input.make, input.model, input.vin]
    .map(slugPart)
    .filter(Boolean)
    .join("-");
}
