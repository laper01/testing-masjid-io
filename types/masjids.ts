// types/masjids.ts

// Type for the data shown in the main table (from the "get all" endpoint)
export type MasjidListItem = {
  id: string;
  name: string;
  location: string;
  isVerified: boolean;
  address: {
    city: string;
    countryCode: string;
  };
  createdAt: string;
  updatedAt: string;
  prayerTimesConfiguration: {
    id: string;
    name: string;
  };
};

// The full, detailed type for the Create/Edit Form
// This assumes the "get by ID" endpoint returns all these fields.
// types/masjids.ts

export type Masjid = {
  id: string;
  name: string;
  location: string;
  isVerified: boolean;
  address: {
    addressLine1: string;
    addressLine2?: string;
    zoneCode: string;
    postalCode: string;
    city: string;
    countryCode: string;
  };
  phoneNumber: {
    countryCode: string;
    number: string;
    extension?: string;
  };
  prayerConfig: {
    name: string;
    method: string;
    fajrAngle: number;
    ishaAngle: number;
    ishaInterval: number;
    asrMethod: string;
    highLatitudeRule: string;
    adjustments: {
      fajrAdjustment: number;
      dhuhrAdjustment: number;
      asrAdjustment: number;
      maghribAdjustment: number;
      ishaAdjustment: number;
    };
  };
  createdAt?: string;
  updatedAt?: string;
};