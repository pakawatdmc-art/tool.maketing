"use client";

import { useState, useEffect } from "react";
import { MapPin, Globe, Server, Clock, Search, Copy, Check, Navigation, Loader2, Crosshair, Info } from "lucide-react";
import { useTranslations } from "next-intl";

interface IpData {
  query: string;
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  error?: string;
}

interface GeoLocation {
  lat: number;
  lon: number;
  accuracy: number;
  city?: string;
  region?: string;
  country?: string;
}

export default function CheckIpPage() {
  const t = useTranslations("CheckIP");
  const [data, setData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [copied, setCopied] = useState(false);

  // GPS / Browser Geolocation state
  const [gpsLocation, setGpsLocation] = useState<GeoLocation | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [useGps, setUseGps] = useState(false);

  const fetchIpData = async (ipToSearch?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = ipToSearch ? `/api/check-ip?ip=${encodeURIComponent(ipToSearch)}` : '/api/check-ip';
      const res = await fetch(url);
      const result = await res.json();
      
      if (!res.ok || result.error) {
        throw new Error(result.error || 'Failed to fetch IP data');
      }
      
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchIpData();
    }, 0);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchIpData(searchInput.trim());
    }
  };

  const handleCopy = async () => {
    if (data?.query) {
      await navigator.clipboard.writeText(data.query);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Request GPS location from browser
  const requestGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("เบราว์เซอร์ของคุณไม่รองรับ GPS Geolocation");
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Reverse geocode using Nominatim (OpenStreetMap) - free, no API key
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
            { headers: { 'User-Agent': '2FA-Tools/1.0' } }
          );
          const geoData = await res.json();
          
          setGpsLocation({
            lat: latitude,
            lon: longitude,
            accuracy: Math.round(accuracy),
            city: geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county || '',
            region: geoData.address?.state || geoData.address?.province || '',
            country: geoData.address?.country || '',
          });
        } catch {
          // Even if reverse geocoding fails, we still have coordinates
          setGpsLocation({
            lat: latitude,
            lon: longitude,
            accuracy: Math.round(accuracy),
          });
        }
        
        setUseGps(true);
        setGpsLoading(false);
      },
      (err) => {
        const messages: Record<number, string> = {
          1: "คุณปฏิเสธการเข้าถึงตำแหน่ง กรุณาอนุญาตในการตั้งค่าเบราว์เซอร์",
          2: "ไม่สามารถระบุตำแหน่งได้ในขณะนี้",
          3: "หมดเวลาในการขอตำแหน่ง",
        };
        setGpsError(messages[err.code] || "เกิดข้อผิดพลาดในการขอตำแหน่ง");
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // Determine which coordinates to show on map
  const displayLat = useGps && gpsLocation ? gpsLocation.lat : data?.lat ?? 0;
  const displayLon = useGps && gpsLocation ? gpsLocation.lon : data?.lon ?? 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 ring-8 ring-primary/5">
          <MapPin className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Search Bar */}
        <div className="bg-card border border-border rounded-2xl p-2 shadow-sm flex items-center mx-auto max-w-2xl">
          <form onSubmit={handleSearch} className="flex w-full">
            <div className="relative flex-grow flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter IPv4 or IPv6 address..."
                className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-foreground"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center ml-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t("check")}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-4 text-center">
            {error}
          </div>
        )}

        {loading && !error && !data && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
          </div>
        )}

        {data && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary IP Card */}
            <div className="lg:col-span-1 bg-card border border-border rounded-3xl p-8 shadow-sm relative overflow-hidden group flex flex-col justify-center items-center text-center">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50"></div>
              
              <div className="relative z-10 w-full">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                  <Navigation className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("myIp")}</p>
                <h2 className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-foreground mb-6 break-all">
                  {data.query}
                </h2>
                
                <button
                  onClick={handleCopy}
                  className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all font-medium border border-border"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied to Clipboard" : "Copy IP Address"}</span>
                </button>
              </div>
            </div>

            {/* Details Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard
                icon={<Globe className="w-5 h-5 text-blue-500" />}
                label="Location (IP)"
                value={`${data.city}, ${data.regionName}`}
                subvalue={`${data.country} (${data.countryCode})`}
              />
              <InfoCard
                icon={<Server className="w-5 h-5 text-purple-500" />}
                label="ISP & Organization"
                value={data.isp}
                subvalue={data.org || data.as}
              />
              <InfoCard
                icon={<Clock className="w-5 h-5 text-orange-500" />}
                label="Timezone"
                value={data.timezone}
                subvalue="Local Time"
              />
              <InfoCard
                icon={<MapPin className="w-5 h-5 text-green-500" />}
                label="Coordinates & ZIP"
                value={useGps && gpsLocation ? `${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lon.toFixed(4)}` : `${data.lat}, ${data.lon}`}
                subvalue={useGps && gpsLocation ? `GPS (±${gpsLocation.accuracy}m)` : `ZIP: ${data.zip || 'N/A'}`}
              />
            </div>

            {/* GPS Precision Section */}
            <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-500 mt-0.5">
                    <Crosshair className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">ตำแหน่งจริงจาก GPS</h3>
                    <p className="text-sm text-muted-foreground">
                      ใช้ GPS/WiFi ของอุปกรณ์ ให้ตำแหน่งที่แม่นยำกว่า IP Geolocation
                    </p>
                    {gpsLocation && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full text-xs font-medium">
                          📍 {gpsLocation.city || 'N/A'}{gpsLocation.region ? `, ${gpsLocation.region}` : ''}
                        </span>
                        <span className="inline-flex items-center bg-green-500/10 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-full text-xs font-medium">
                          🎯 ±{gpsLocation.accuracy}m
                        </span>
                        {gpsLocation.country && (
                          <span className="inline-flex items-center bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-full text-xs font-medium">
                            🌍 {gpsLocation.country}
                          </span>
                        )}
                      </div>
                    )}
                    {gpsError && (
                      <p className="text-sm text-destructive mt-2">{gpsError}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={requestGpsLocation}
                    disabled={gpsLoading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center text-sm"
                  >
                    {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Crosshair className="w-4 h-4 mr-2" />}
                    {gpsLocation ? 'อัปเดตตำแหน่ง' : 'ขอตำแหน่ง GPS'}
                  </button>
                  {gpsLocation && (
                    <button
                      onClick={() => setUseGps(!useGps)}
                      className={`px-4 py-2.5 rounded-xl font-medium transition-colors text-sm border ${
                        useGps 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' 
                          : 'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80'
                      }`}
                    >
                      {useGps ? '🛰️ แสดง GPS' : '📡 แสดง IP'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Accuracy Note */}
            <div className="lg:col-span-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  <p className="font-medium mb-1">เกี่ยวกับความแม่นยำของตำแหน่ง</p>
                  <p className="text-xs opacity-80 leading-relaxed">
                    ตำแหน่งจาก IP Address อ่านจากฐานข้อมูลของ ISP ซึ่งมีความแม่นยำระดับจังหวัด/ภูมิภาคเท่านั้น 
                    หาก ISP ลงทะเบียน IP ไว้ที่ศูนย์กลางของภูมิภาค ตำแหน่งอาจไม่ตรงกับที่คุณอยู่จริง 
                    สำหรับตำแหน่งที่แม่นยำกว่า ให้ใช้ปุ่ม &quot;ขอตำแหน่ง GPS&quot; ด้านบน ซึ่งจะใช้ GPS/WiFi ของอุปกรณ์คุณโดยตรง
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="lg:col-span-3 bg-card border border-border rounded-3xl p-2 shadow-sm h-[400px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-muted/20 animate-pulse -z-10"></div>
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                className="rounded-2xl"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${displayLon - 0.05},${displayLat - 0.05},${displayLon + 0.05},${displayLat + 0.05}&layer=mapnik&marker=${displayLat},${displayLon}`}
              ></iframe>
              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border shadow-sm text-xs font-medium flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 animate-pulse ${useGps && gpsLocation ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                {useGps && gpsLocation ? `GPS (±${gpsLocation.accuracy}m)` : 'IP Approximated'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, subvalue }: { icon: React.ReactNode, label: string, value: string, subvalue?: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-center transition-all hover:border-primary/30 hover:shadow-md relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        {icon}
      </div>
      <div className="flex items-center space-x-3 mb-3">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          {icon}
        </div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
      <div>
        <p className="text-foreground font-bold text-lg leading-tight mb-1">{value || 'N/A'}</p>
        {subvalue && <p className="text-muted-foreground text-sm font-medium">{subvalue}</p>}
      </div>
    </div>
  );
}
