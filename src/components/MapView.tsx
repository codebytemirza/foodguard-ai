"use client";

import { MapContainer, TileLayer, Popup, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { AlertTriangle, CheckCircle2, TrendingUp, XCircle } from "lucide-react";

// Fix Leaflet icon issue in Next.js
if (typeof window !== "undefined") {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
}

interface Region {
  name: string;
  riskLevel: "Critical" | "High" | "Medium" | "Low";
  coordinates: { lat: number; lng: number };
  shortageAmount: number;
  recommendedAction: string;
  confidenceScore: number;
  affectedCrops?: string[];
  keyFactors?: string[];
}

export default function MapView({ regions }: { regions: Region[] }) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Critical": return "#991b1b"; // red-800
      case "High": return "#c2410c"; // orange-700
      case "Medium": return "#b45309"; // amber-700
      case "Low": return "#15803d"; // green-700
      default: return "#1f2937"; // gray-800
    }
  };

  const getRiskRadius = (risk: string, shortage: number) => {
    let baseRadius = 12;
    switch (risk) {
      case "Critical": baseRadius = 20; break;
      case "High": baseRadius = 16; break;
      case "Medium": baseRadius = 12; break;
      case "Low": baseRadius = 10; break;
    }
    return baseRadius + Math.min(shortage / 300, 15);
  };

  const getRiskIcon = (risk: string) => {
    const iconClass = "w-3.5 h-3.5";
    switch (risk) {
      case "Critical": return <XCircle className={iconClass} />;
      case "High": return <AlertTriangle className={iconClass} />;
      case "Medium": return <TrendingUp className={iconClass} />;
      case "Low": return <CheckCircle2 className={iconClass} />;
      default: return null;
    }
  };

  // Calculate center of all regions
  const center: [number, number] = regions.length > 0
    ? [
        regions.reduce((sum, r) => sum + r.coordinates.lat, 0) / regions.length,
        regions.reduce((sum, r) => sum + r.coordinates.lng, 0) / regions.length
      ]
    : [30.3753, 69.3451]; // Pakistan center

  return (
    <div className="h-[500px] w-full border-2 border-neutral-800 overflow-hidden">
      <MapContainer 
        center={center} 
        zoom={regions.length === 1 ? 10 : 6} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        className="z-0 grayscale-[15%]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {regions.map((region, idx) => (
          <CircleMarker
            key={idx}
            center={[region.coordinates.lat, region.coordinates.lng]}
            pathOptions={{ 
              color: getRiskColor(region.riskLevel), 
              fillColor: getRiskColor(region.riskLevel), 
              fillOpacity: 0.5,
              weight: 3,
              opacity: 1
            }}
            radius={getRiskRadius(region.riskLevel, region.shortageAmount)}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} className="text-xs font-semibold">
              {region.name} - {region.riskLevel}
            </Tooltip>
            <Popup maxWidth={320} className="custom-popup">
              <div className="p-1 min-w-[280px] font-sans">
                <div className="border-b-2 border-neutral-800 pb-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-base text-neutral-900" style={{ fontFamily: 'Georgia, serif' }}>
                      {region.name}
                    </h3>
                    <div 
                      className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 border-2 uppercase"
                      style={{ 
                        color: getRiskColor(region.riskLevel),
                        borderColor: getRiskColor(region.riskLevel),
                        backgroundColor: `${getRiskColor(region.riskLevel)}10`
                      }}
                    >
                      {getRiskIcon(region.riskLevel)}
                      {region.riskLevel}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                        Shortage Volume
                      </div>
                      <div className="text-sm font-bold text-neutral-900 tabular-nums">
                        {region.shortageAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-neutral-500">metric tons</div>
                    </div>
                    
                    <div>
                      <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                        Confidence
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-neutral-200 border border-neutral-300">
                          <div
                            className="h-full bg-neutral-900"
                            style={{ width: `${region.confidenceScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold tabular-nums">{region.confidenceScore}%</span>
                      </div>
                    </div>
                  </div>

                  {region.affectedCrops && region.affectedCrops.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                        Affected Crops
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {region.affectedCrops.map((crop, i) => (
                          <span 
                            key={i} 
                            className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 border border-neutral-300 font-medium"
                          >
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {region.keyFactors && region.keyFactors.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                        Risk Factors
                      </div>
                      <ul className="space-y-1">
                        {region.keyFactors.slice(0, 3).map((factor, i) => (
                          <li key={i} className="text-xs text-neutral-700 flex items-start leading-relaxed">
                            <span className="mr-2 mt-0.5 w-1 h-1 bg-neutral-900 rounded-full flex-shrink-0"></span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="pt-3 border-t-2 border-neutral-300">
                  <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Recommended Action
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                    {region.recommendedAction}
                  </p>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background-color: white;
          border: 2px solid #262626;
          border-radius: 0;
          box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
          padding: 0;
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 0;
          width: 100% !important;
        }
        
        .custom-popup .leaflet-popup-tip {
          background-color: white;
          border: 2px solid #262626;
          border-top: none;
          border-right: none;
          box-shadow: -1px 1px 0px 0px rgba(0,0,0,1);
        }

        .leaflet-tooltip {
          background-color: #262626;
          border: 2px solid #000;
          border-radius: 0;
          color: white;
          box-shadow: 3px 3px 0px 0px rgba(0,0,0,1);
          padding: 4px 8px;
        }

        .leaflet-tooltip-top:before {
          border-top-color: #000;
        }
      `}</style>
    </div>
  );
}