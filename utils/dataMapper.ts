// utils/dataMapper.ts
import { Masjid } from '@/types/masjids';

// Converts the API's snake_case response to the camelCase format for the frontend
export const mapApiToForm = (apiData: any): Masjid => {
  const address = apiData.address || {};
  const phoneNumber = apiData.phone_number || {};
  const prayerConfig = apiData.prayer_times_configuration || {};
  const adjustments = prayerConfig.adjustments || {};

  return {
    id: apiData.id,
    name: apiData.name,
    location: apiData.location,
    isVerified: apiData.is_verified,
    latitude: apiData.latitude, // ADDED
    longitude: apiData.longitude, // ADDED
    address: {
      addressLine1: address.address_line_1,
      addressLine2: address.address_line_2,
      city: address.city,
      postalCode: address.postal_code,
      countryCode: address.country_code,
      zoneCode: address.zone_code || '',
    },
    phoneNumber: {
      countryCode: phoneNumber.country_code,
      number: phoneNumber.number,
    },
    prayerConfig: {
      name: prayerConfig.name,
      method: prayerConfig.method,
      fajrAngle: prayerConfig.fajr_angle,
      ishaAngle: prayerConfig.isha_angle,
      ishaInterval: prayerConfig.isha_interval,
      asrMethod: prayerConfig.asr_method,
      highLatitudeRule: prayerConfig.high_latitude_rule,
      adjustments: {
        fajrAdjustment: adjustments.fajr,
        dhuhrAdjustment: adjustments.dhuhr,
        asrAdjustment: adjustments.asr,
        maghribAdjustment: adjustments.maghrib,
        ishaAdjustment: adjustments.isha,
      },
    },
    createdAt: apiData.created_at,
    updatedAt: apiData.updated_at,
  };
};

// Converts the form's camelCase data to the snake_case format for the POST/PATCH API
export const mapFormToApi = (formData: any): any => {
  return {
    name: formData.name,
    location: formData.location,
    is_verified: formData.isVerified,
    latitude: String(formData.latitude), // ADDED and converted to string
    longitude: String(formData.longitude), // ADDED and converted to string
    address: {
      address_line_1: formData.address.addressLine1,
      address_line_2: formData.address.addressLine2,
      city: formData.address.city,
      postal_code: formData.address.postalCode,
      country_code: formData.address.countryCode,
      zone_code: formData.address.zoneCode,
    },
    phone_number: {
      country_code: formData.phoneNumber.countryCode,
      number: formData.phoneNumber.number,
    },
    prayer_times_configuration: {
      name: formData.prayerConfig.name,
      method: formData.prayerConfig.method,
      fajr_angle: formData.prayerConfig.fajrAngle,
      isha_angle: formData.prayerConfig.ishaAngle,
      isha_interval: formData.prayerConfig.ishaInterval,
      asr_method: formData.prayerConfig.asrMethod,
      high_latitude_rule: formData.prayerConfig.highLatitudeRule,
      adjustments: {
        fajr: formData.prayerConfig.adjustments.fajrAdjustment,
        dhuhr: formData.prayerConfig.adjustments.dhuhrAdjustment,
        asr: formData.prayerConfig.adjustments.asrAdjustment,
        maghrib: formData.prayerConfig.adjustments.maghribAdjustment,
        isha: formData.prayerConfig.adjustments.ishaAdjustment,
      },
    },
  };
};