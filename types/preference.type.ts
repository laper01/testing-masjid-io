export type PrayerTimeAdjustments = {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
};

export type PrayerTimesConfiguration = {
  name: string;
  method: string;
  asr_method: string;
  high_latitude_rule: string;
  adjustments: PrayerTimeAdjustments;
};

export type Preference = {
  id: string;
  userId: string;
  adhanFileId: string;
  createTime: string;
  updateTime: string;
  // It's good practice to include the nested object, even if you only use adhanFileId for now
  prayerTimesConfiguration?: PrayerTimesConfiguration; 
};

