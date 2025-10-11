'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import * as Icon from 'react-feather';
import Image from 'next/image';
import * as adhan from 'adhan';
import moment from 'moment';

// --- 1. TYPES to match the API response ---
type PrayerTimeAdjustments = {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
};

type PrayerTimesConfiguration = {
    id: string;
    name: string;
    method?: string;
    asr_method?: string;
    high_latitude_rule?: string;
    adjustments?: PrayerTimeAdjustments;
};

type AdhanFile = {
    id: string;
    name: string;
    url: string;
    masjidId: string;
};

type Masjid = {
    id: string;
    name: string;
    location: string;
    isVerified: boolean;
    address: {
        addressLine1: string;
        addressLine2?: string;
        postalCode: string;
        city: string;
        countryCode: string;
    };
    phoneNumber: {
        countryCode: string;
        number: string;
    };
    prayerTimesConfiguration: PrayerTimesConfiguration;
    adhanFiles: AdhanFile[];
};

type PrayerTimes = {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
};


// --- Helper Functions ---
const getAdhanMethod = (apiMethod?: string) => {
    switch (apiMethod) {
        case 'MUSLIM_WORLD_LEAGUE': return adhan.CalculationMethod.MuslimWorldLeague();
        case 'EGYPTIAN': return adhan.CalculationMethod.Egyptian();
        case 'KARACHI': return adhan.CalculationMethod.Karachi();
        case 'UMM_AL_QURA': return adhan.CalculationMethod.UmmAlQura();
        case 'DUBAI': return adhan.CalculationMethod.Dubai();
        case 'MOON_SIGHTING_COMMITTEE': return adhan.CalculationMethod.MoonsightingCommittee();
        case 'NORTH_AMERICA': return adhan.CalculationMethod.NorthAmerica();
        case 'KUWAIT': return adhan.CalculationMethod.Kuwait();
        case 'QATAR': return adhan.CalculationMethod.Qatar();
        case 'SINGAPORE': return adhan.CalculationMethod.Singapore();
        case 'OTHER': return adhan.CalculationMethod.Other();
        default: return adhan.CalculationMethod.MuslimWorldLeague();
    }
};

const getHighLatitudeRule = (apiRule?: string) => {
    switch (apiRule) {
        case 'MIDDLE_OF_THE_NIGHT': return adhan.HighLatitudeRule.MiddleOfTheNight;
        case 'SEVENTH_OF_THE_NIGHT': return adhan.HighLatitudeRule.SeventhOfTheNight;
        case 'TWILIGHT_ANGLE': return adhan.HighLatitudeRule.TwilightAngle;
        default: return adhan.HighLatitudeRule.MiddleOfTheNight;
    }
};

const getCoordinatesFromAddress = async (address: string) => {
    try {
        const encodedAddress = encodeURIComponent(address);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`, {
            headers: { 'User-Agent': 'Masjid-App/1.0 (contact@example.com)' }
        });
        if (!response.ok) throw new Error('Failed to connect to geocoding service.');
        const data = await response.json();
        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
        }
        console.warn('Address could not be geocoded:', address);
        return null;
    } catch (error) {
        console.error("Geocoding Error:", error);
        return null;
    }
};


export default function MasjidSingle() {
    const [activeTab, setActiveTab] = useState(1);
    const [masjidData, setMasjidData] = useState<Masjid | null>(null);
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    useEffect(() => {
        if (!id) return;

        const fetchMasjidAndCalculateTimes = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await fetch(`/api/masjids/${id}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to fetch masjid data.");
                }
                
                const data: Masjid = await response.json();
                setMasjidData(data);

                const fullAddress = [data.address.addressLine1, data.address.city, data.location].filter(Boolean).join(', ');
                const coords = await getCoordinatesFromAddress(fullAddress);

                if (coords && data.prayerTimesConfiguration) {
                    const coordinates = new adhan.Coordinates(coords.latitude, coords.longitude);
                    const config = data.prayerTimesConfiguration;
                    const prayerParams = getAdhanMethod(config.method);
                    
                    prayerParams.highLatitudeRule = getHighLatitudeRule(config.high_latitude_rule);
                    
                    if (config.adjustments) {
                        prayerParams.adjustments = {
                            fajr: config.adjustments.fajr || 0,
                            dhuhr: config.adjustments.dhuhr || 0,
                            asr: config.adjustments.asr || 0,
                            maghrib: config.adjustments.maghrib || 0,
                            isha: config.adjustments.isha || 0,
                            sunrise: 0,
                        };
                    }

                    const date = new Date();
                    const prayers = new adhan.PrayerTimes(coordinates, date, prayerParams);

                    setPrayerTimes({
                        Fajr: moment(prayers.fajr).format("HH:mm"),
                        Dhuhr: moment(prayers.dhuhr).format("HH:mm"),
                        Asr: moment(prayers.asr).format("HH:mm"),
                        Maghrib: moment(prayers.maghrib).format("HH:mm"),
                        Isha: moment(prayers.isha).format("HH:mm"),
                    });
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMasjidAndCalculateTimes();
    }, [id, router]);

    if (loading) return <Layout><div>Loading...</div></Layout>;
    if (error) return <Layout><div>Error: {error}</div></Layout>;
    if (!masjidData) return <Layout><div>Masjid not found.</div></Layout>;

    const fullAddressString = [
        masjidData.address.addressLine1,
        masjidData.address.addressLine2,
        masjidData.address.city,
        masjidData.address.postalCode,
        masjidData.location
    ].filter(Boolean).join(', ');

    return (
        <Layout>
            <div>
                <section className="pt-100 layout-pb-sm">
                    <div className="container pt-100 md:pt-60 sm:pt-40">
                        <div className="row y-gap-60 items-center">
                            <div className="col-lg-6">
                                <div className="ratio ratio-62:60">
                                    <Image width={0} height={0} sizes="100vw" style={{width: '100%', height: 'auto'}} className="absolute-full-center rounded-8 object-fit-cover" src="/img/forms/bg.png" alt="Masjid image" />
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="pl-40 pb-80 lg:pl-0 md:pb-0">
                                    <h2 className="text-32 mt-4 d-flex items-center">
                                        {masjidData.name}
                                        {masjidData.isVerified && (
                                            <span className="d-inline-flex ml-10" style={{ color: '#35B27D' }}>
                                                <Icon.CheckCircle size={28} />
                                            </span>
                                        )}
                                    </h2>
                                    
                                    <div className="mt-30">
                                        <p>A central place of worship and community gathering in {masjidData.address.city}, {masjidData.location}. Welcoming visitors and locals for daily prayers and events.</p>
                                    </div>

                                    <div className="pt-30">
                                        <p><b>Address:</b> {fullAddressString}</p>
                                        <p><b>Phone:</b> +{masjidData.phoneNumber.countryCode} {masjidData.phoneNumber.number}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="layout-pt-sm layout-pb-lg">
                    <div className="tabs -active-accent js-tabs">
                        <div className="row pt-30 border-top-dark">
                            <div className="col-12">
                                <div className="tabs__controls d-flex justify-center js-tabs-controls">
                                    <button className={`tabs__button js-tabs-button ${activeTab === 1 ? "is-active" : ""}`} onClick={() => setActiveTab(1)}>Description</button>
                                    <button className={`tabs__button js-tabs-button ml-32 ${activeTab === 2 ? "is-active" : ""}`} onClick={() => setActiveTab(2)}>Prayer Times</button>
                                    <button className={`tabs__button js-tabs-button ml-32 ${activeTab === 3 ? "is-active" : ""}`} onClick={() => setActiveTab(3)}>Adhan Sounds</button>
                                </div>
                            </div>
                            <div className="container">
                                <div className="tabs__content pt-60 js-tabs-content">
                                    <div className={`tabs__pane -tab-item-1 ${activeTab === 1 ? "is-active" : ""}`}>
                                        <div className="row justify-center">
                                            <div className="col-xl-8 col-lg-9 col-md-11">
                                                <h4 className="text-xl fw-600">About The Masjid</h4>
                                                <p className="mt-20">
                                                    Established as a cornerstone of the local Muslim community, {masjidData.name} stands as a beacon of faith and unity. Its architecture blends modern design with traditional Islamic motifs, creating a serene and inspiring atmosphere for worship.
                                                    <br /><br />
                                                    The masjid serves not only as a prayer hall but also as a vibrant community center, offering educational programs for all ages, social services, and interfaith dialogue initiatives. Our mission is to foster a deeper understanding of Islam and to serve the needs of our community in accordance with Islamic principles of peace, compassion, and justice.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`tabs__pane -tab-item-2 ${activeTab === 2 ? "is-active" : ""}`}>
                                        <div className="row justify-center">
                                            <div className="col-xl-6 col-lg-8 col-md-10">
                                                <h3 className="text-22 fw-600 text-center">Today's Prayer Times</h3>
                                                {prayerTimes ? (
                                                    <>
                                                        <ul className="list-group mt-32">
                                                            <li className="list-group-item d-flex justify-content-between align-items-center py-3">Fajr <span className="text-lg fw-600">{prayerTimes.Fajr}</span></li>
                                                            <li className="list-group-item d-flex justify-content-between align-items-center py-3">Dhuhr <span className="text-lg fw-600">{prayerTimes.Dhuhr}</span></li>
                                                            <li className="list-group-item d-flex justify-content-between align-items-center py-3">Asr <span className="text-lg fw-600">{prayerTimes.Asr}</span></li>
                                                            <li className="list-group-item d-flex justify-content-between align-items-center py-3">Maghrib <span className="text-lg fw-600">{prayerTimes.Maghrib}</span></li>
                                                            <li className="list-group-item d-flex justify-content-between align-items-center py-3">Isha <span className="text-lg fw-600">{prayerTimes.Isha}</span></li>
                                                        </ul>
                                                        <p className="text-center mt-20 text-sm text-capitalize">
                                                            Calculation Method: {masjidData.prayerTimesConfiguration.name}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <div className="text-center mt-32 py-4 px-3" style={{ background: '#FFFBEB', border: '1px solid #FEEBC8', borderRadius: '8px' }}>
                                                        <Icon.AlertTriangle size={32} className="mx-auto" style={{ color: '#F59E0B' }} />
                                                        <h5 className="fw-600 mt-3" style={{ color: '#B45309' }}>Location Not Found</h5>
                                                        <p className="mt-2 text-dark">
                                                            We could not find the exact location for this address to calculate prayer times.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`tabs__pane -tab-item-3 ${activeTab === 3 ? "is-active" : ""}`}>
                                        <div className="row justify-center">
                                            <div className="col-xl-8 col-lg-9 col-md-11">
                                                <h4 className="text-xl fw-600">Available Adhan Sounds</h4>
                                                {masjidData.adhanFiles.length > 0 ? (
                                                    <ul className="list-group mt-20">
                                                        {masjidData.adhanFiles.map(file => (
                                                            <li key={file.id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                                                                <span>{file.name}</span>
                                                                <audio controls src={file.url} style={{ maxWidth: '250px' }} />
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="mt-20 text-muted">No custom adhan sounds have been uploaded for this masjid.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}

