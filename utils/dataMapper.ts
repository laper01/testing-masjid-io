// utils/dataMapper.ts
import { Masjid } from '@/types/masjids';

// Converts the API's snake_case response to the camelCase format for the frontend
export const mapApiToForm = (apiData: any): Masjid => {
  return {
    id: apiData.id,
    name: apiData.name,
    location: apiData.location,
    isVerified: apiData.is_verified,
    address: {
      addressLine1: apiData.address?.address_line_1,
      addressLine2: apiData.address?.address_line_2,
      city: apiData.address?.city,
      postalCode: apiData.address?.postal_code,
      countryCode: apiData.address?.country_code,
      zoneCode: apiData.address?.zone_code || '',
    },
    phoneNumber: {
      countryCode: apiData.phone_number?.country_code,
      number: apiData.phone_number?.number,
    },
    prayerConfig: {
      name: apiData.prayer_times_configuration?.name,
      method: apiData.prayer_times_configuration?.method,
      fajrAngle: apiData.prayer_times_configuration?.fajr_angle,
      ishaAngle: apiData.prayer_times_configuration?.isha_angle,
      ishaInterval: apiData.prayer_times_configuration?.isha_interval,
      asrMethod: apiData.prayer_times_configuration?.asr_method,
      highLatitudeRule: apiData.prayer_times_configuration?.high_latitude_rule,
      adjustments: {
        fajrAdjustment: apiData.prayer_times_configuration?.adjustments?.fajr,
        dhuhrAdjustment: apiData.prayer_times_configuration?.adjustments?.dhuhr,
        asrAdjustment: apiData.prayer_times_configuration?.adjustments?.asr,
        maghribAdjustment: apiData.prayer_times_configuration?.adjustments?.maghrib,
        ishaAdjustment: apiData.prayer_times_configuration?.adjustments?.isha,
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