export const BODY_STYLES = [
  "Sedan",
  "Coupe",
  "SUV",
  "Convertible",
  "Wagon",
  "Hatchback",
  "Truck",
  "Van",
  "Other",
] as const;

export type BodyStyle = (typeof BODY_STYLES)[number];

export type VehiclePhoto = {
  src: string;
  alt: string;
};

export type Vehicle = {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  miles: number;
  price: number;
  body: BodyStyle;
  /** True when body style was inferred because the feed did not provide one. */
  bodyDerived: boolean;
  color: string | null;
  photos: VehiclePhoto[];
  slug: string;
  legacyPath: string | null;
  stock: string | null;
};

export type RawVehicle = {
  year?: string | number | null;
  make?: string | null;
  model?: string | null;
  trim?: string | null;
  miles?: string | number | null;
  price?: string | number | null;
  img?: string | null;
  images?: string[] | null;
  url?: string | null;
  body?: string | null;
  vin?: string | null;
  color?: string | null;
  stock?: string | null;
};

export type InventorySnapshot = {
  sourceId: string;
  /** ISO date (YYYY-MM-DD) when the source last confirmed the data, if known. */
  updatedAt: string | null;
  vehicles: Vehicle[];
};

export interface InventorySource {
  readonly id: string;
  load(): Promise<InventorySnapshot>;
}
