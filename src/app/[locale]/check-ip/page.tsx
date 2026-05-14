"use client";

import { useState, useEffect } from "react";
import { MapPin, Globe, Server, Clock, Search, Copy, Check, Navigation, Loader2 } from "lucide-react";
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

export default function CheckIpPage() {
  const t = useTranslations("CheckIP");
  const [data, setData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [copied, setCopied] = useState(false);

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
                label="Location"
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
                value={`${data.lat}, ${data.lon}`}
                subvalue={`ZIP: ${data.zip || 'N/A'}`}
              />
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
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.lon - 0.05},${data.lat - 0.05},${data.lon + 0.05},${data.lat + 0.05}&layer=mapnik&marker=${data.lat},${data.lon}`}
              ></iframe>
              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border shadow-sm text-xs font-medium flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                Location Approximated
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
