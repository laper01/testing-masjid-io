export type AdhanFile = {
  id: string;
  name: string;
  url: string;
  masjidId: string;
  createdAt: string;
  updatedAt: string;
};

// Represents a single Masjid record from your API
export type Masjid = {
  id: string;
  name: string;
  location: string;
  phoneNumber?: {
    countryCode: string;
    number: string;
  };
};

export type Preference = {
  id: string;
  userId: string;
  adhanFileId: string;
  createTime: string;
  updateTime: string;
};
