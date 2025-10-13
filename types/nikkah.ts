// types/nikkah.ts

// Enum untuk gender dan bulan agar konsisten dengan data dari API
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum Month {
  JANUARY = 'JANUARY',
  FEBRUARY = 'FEBRUARY',
  MARCH = 'MARCH',
  APRIL = 'APRIL',
  MAY = 'MAY',
  JUNE = 'JUNE',
  JULY = 'JULY',
  AUGUST = 'AUGUST',
  SEPTEMBER = 'SEPTEMBER',
  OCTOBER = 'OCTOBER',
  NOVEMBER = 'NOVEMBER',
  DECEMBER = 'DECEMBER',
}

// Tipe untuk objek tanggal lahir
export interface BirthDate {
  year: number;
  month: Month;
  day: number;
}

// Tipe untuk pengaturan privasi
export interface PrivacySettings {
  showPictures: boolean;
  showRealName: boolean;
}

// Tipe utama untuk satu profil Nikkah
export interface NikkahProfile {
  id: string;
  userId: string;
  name: string;
  gender: Gender;
  birthDate: BirthDate;
  createTime: string; // ISO 8601 date string
  updateTime: string; // ISO 8601 date string
  privacySettings?: PrivacySettings;
  status: string; // e.g., 'PROFILE_STATUS_ACTIVE'
}

// Tipe untuk data yang dibutuhkan saat membuat profil (Create Payload)
export type CreateNikkahProfileDTO = Omit<NikkahProfile, 'id' | 'userId' | 'createTime' | 'updateTime' | 'status' | 'privacySettings'>;

// Tipe untuk data yang dibutuhkan saat mengupdate profil (Update Payload)
export type UpdateNikkahProfileDTO = Partial<CreateNikkahProfileDTO>;