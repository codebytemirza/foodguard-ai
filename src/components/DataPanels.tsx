"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, TrendingUp, Warehouse, Sprout, Database, Calendar } from "lucide-react";

interface DataPanelsProps {
    weatherData?: any;
    marketData?: any;
    warehouseData?: any;
    productionData?: any;
    cropHealthData?: any;
    historicalData?: any;
}

export default function DataPanels({
    weatherData,
    marketData,
    warehouseData,
    productionData,
    cropHealthData,
    historicalData
}: DataPanelsProps) {
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Weather Data Panel */}
            {weatherData && (
                <div className="bg-white border-2 border-neutral-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="border-b-2 border-neutral-800 bg-neutral-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Cloud className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Weather Conditions</span>
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Temperature</div>
                                <div className="text-lg font-bold text-neutral-900 tabular-nums">
                                    {weatherData.current?.temperature || 'N/A'}°C
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Humidity</div>
                                <div className="text-lg font-bold text-neutral-900 tabular-nums">
                                    {weatherData.current?.humidity || 'N/A'}%
                                </div>
                            </div>
                        </div>
                        
                        <div className="border-t border-neutral-300 pt-3">
                            <div className="text-xs font-bold text-neutral-500 uppercase mb-2">7-Day Forecast</div>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Avg Temperature:</span>
                                    <span className="font-semibold tabular-nums">{weatherData.forecast?.avgTemp7Day || 'N/A'}°C</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Rainfall (24h):</span>
                                    <span className="font-semibold tabular-nums">{weatherData.forecast?.rainfall24h || 'N/A'} mm</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Rainfall (7d):</span>
                                    <span className="font-semibold tabular-nums">{weatherData.forecast?.rainfall7d || 'N/A'} mm</span>
                                </div>
                            </div>
                        </div>

                        {weatherData.agriculturalImpact && (
                            <div className="border-t border-neutral-300 pt-3">
                                <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Agricultural Impact</div>
                                <div className={`text-xs px-2 py-1 border-2 font-semibold inline-block ${
                                    weatherData.agriculturalImpact.riskLevel === 'High' 
                                        ? 'bg-red-50 text-red-800 border-red-300'
                                        : weatherData.agriculturalImpact.riskLevel === 'Medium'
                                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                                        : 'bg-green-50 text-green-800 border-green-300'
                                }`}>
                                    {weatherData.agriculturalImpact.riskLevel} Risk
                                </div>
                                <p className="text-xs text-neutral-600 mt-2">{weatherData.agriculturalImpact.cropStress}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Market Price Panel */}
            {marketData && (
                <div className="bg-white border-2 border-neutral-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="border-b-2 border-neutral-800 bg-neutral-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Market Analysis</span>
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        <div>
                            <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Commodity</div>
                            <div className="text-sm font-bold text-neutral-900">{marketData.commodityName || marketData.crop}</div>
                        </div>

                        <div className="border-t border-neutral-300 pt-3">
                            <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Price Trends</div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-600">Current Price:</span>
                                    <span className="font-bold text-neutral-900 tabular-nums">
                                        ${marketData.prices?.current || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-600">Monthly Change:</span>
                                    <span className={`font-semibold tabular-nums ${
                                        parseFloat(marketData.changes?.monthly?.percent || 0) > 0 
                                            ? 'text-red-700' 
                                            : 'text-green-700'
                                    }`}>
                                        {marketData.changes?.monthly?.percent || 'N/A'}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-neutral-600">Yearly Change:</span>
                                    <span className={`font-semibold tabular-nums ${
                                        parseFloat(marketData.changes?.yearly?.percent || 0) > 0 
                                            ? 'text-red-700' 
                                            : 'text-green-700'
                                    }`}>
                                        {marketData.changes?.yearly?.percent || 'N/A'}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {marketData.supplySignal && (
                            <div className="border-t border-neutral-300 pt-3">
                                <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Supply Signal</div>
                                <div className="text-xs bg-neutral-100 border-2 border-neutral-300 px-2 py-2 text-neutral-700">
                                    {marketData.supplySignal}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Warehouse Stock Panel */}
            {warehouseData && (
                <div className="bg-white border-2 border-neutral-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="border-b-2 border-neutral-800 bg-neutral-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Warehouse className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Warehouse Inventory</span>
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        <div>
                            <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Region</div>
                            <div className="text-sm font-bold text-neutral-900">{warehouseData.region}</div>
                        </div>

                        <div className="border-t border-neutral-300 pt-3">
                            <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Stock Levels</div>
                            <div className="space-y-2 text-xs">
                                {warehouseData.stocks?.wheat && (
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">Wheat:</span>
                                        <span className="font-semibold tabular-nums">{warehouseData.stocks.wheat.amount.toLocaleString()} MT</span>
                                    </div>
                                )}
                                {warehouseData.stocks?.rice && (
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">Rice:</span>
                                        <span className="font-semibold tabular-nums">{warehouseData.stocks.rice.amount.toLocaleString()} MT</span>
                                    </div>
                                )}
                                {warehouseData.stocks?.total && (
                                    <div className="flex justify-between border-t border-neutral-300 pt-2 mt-2">
                                        <span className="text-neutral-900 font-bold">Total:</span>
                                        <span className="font-bold tabular-nums">{warehouseData.stocks.total.amount.toLocaleString()} MT</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {warehouseData.capacity && (
                            <div className="border-t border-neutral-300 pt-3">
                                <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Capacity Utilization</div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-3 bg-neutral-200 border-2 border-neutral-300">
                                        <div
                                            className="h-full bg-neutral-900"
                                            style={{ width: `${warehouseData.capacity.utilizationPercent}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold tabular-nums">{warehouseData.capacity.utilizationPercent}%</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Production Forecast Panel */}
            {productionData && (
                <div className="bg-white border-2 border-neutral-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="border-b-2 border-neutral-800 bg-neutral-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Sprout className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Production Forecast</span>
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Region</div>
                                <div className="text-sm font-bold text-neutral-900">{productionData.region}</div>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Crop</div>
                                <div className="text-sm font-bold text-neutral-900 capitalize">{productionData.crop}</div>
                            </div>
                        </div>

                        <div className="border-t border-neutral-300 pt-3">
                            <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Yield Estimate</div>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Expected Yield:</span>
                                    <span className="font-bold tabular-nums">{productionData.expectedYield?.toLocaleString() || 'N/A'} kg/ha</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">vs Baseline:</span>
                                    <span className={`font-semibold ${
                                        productionData.yieldChange?.startsWith('+') 
                                            ? 'text-green-700' 
                                            : 'text-red-700'
                                    }`}>
                                        {productionData.yieldChange || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Confidence:</span>
                                    <span className="font-semibold tabular-nums">{productionData.confidenceLevel || 'N/A'}%</span>
                                </div>
                            </div>
                        </div>

                        {productionData.harvestPeriod && (
                            <div className="border-t border-neutral-300 pt-3">
                                <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Harvest Period</div>
                                <div className="text-xs bg-neutral-100 border border-neutral-300 px-2 py-1 text-neutral-700 inline-block">
                                    {productionData.harvestPeriod}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Crop Health Panel */}
            {cropHealthData && (
                <div className="bg-white border-2 border-neutral-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="border-b-2 border-neutral-800 bg-neutral-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Sprout className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Crop Health Status</span>
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        <div>
                            <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Region</div>
                            <div className="text-sm font-bold text-neutral-900">{cropHealthData.region}</div>
                        </div>

                        <div className="border-t border-neutral-300 pt-3">
                            <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Health Assessment</div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex-1 h-3 bg-neutral-200 border-2 border-neutral-300">
                                    <div
                                        className={`h-full ${
                                            cropHealthData.cropHealthScore > 75 
                                                ? 'bg-green-700' 
                                                : cropHealthData.cropHealthScore > 50 
                                                ? 'bg-amber-700' 
                                                : 'bg-red-700'
                                        }`}
                                        style={{ width: `${cropHealthData.cropHealthScore}%` }}
                                    />
                                </div>
                                <span className="text-xs font-bold tabular-nums">{cropHealthData.cropHealthScore}/100</span>
                            </div>
                            <div className={`text-xs px-2 py-1 border-2 font-semibold inline-block ${
                                cropHealthData.condition === 'Excellent' 
                                    ? 'bg-green-50 text-green-800 border-green-300'
                                    : cropHealthData.condition === 'Good'
                                    ? 'bg-green-50 text-green-700 border-green-300'
                                    : cropHealthData.condition === 'Fair'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : 'bg-red-50 text-red-800 border-red-300'
                            }`}>
                                {cropHealthData.condition}
                            </div>
                        </div>

                        {cropHealthData.metrics && (
                            <div className="border-t border-neutral-300 pt-3">
                                <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Key Metrics</div>
                                <div className="space-y-1 text-xs">
                                    {cropHealthData.metrics.temperature && (
                                        <div className="flex justify-between">
                                            <span className="text-neutral-600">Avg Temperature:</span>
                                            <span className="font-semibold tabular-nums">{cropHealthData.metrics.temperature.average}°C</span>
                                        </div>
                                    )}
                                    {cropHealthData.metrics.rainfall && (
                                        <div className="flex justify-between">
                                            <span className="text-neutral-600">Total Rainfall:</span>
                                            <span className="font-semibold tabular-nums">{cropHealthData.metrics.rainfall.total} mm</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {cropHealthData.risks && cropHealthData.risks.length > 0 && (
                            <div className="border-t border-neutral-300 pt-3">
                                <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Risk Factors</div>
                                <ul className="space-y-1">
                                    {cropHealthData.risks.slice(0, 3).map((risk: string, i: number) => (
                                        <li key={i} className="text-xs text-neutral-700 flex items-start">
                                            <span className="mr-2 mt-0.5 w-1 h-1 bg-neutral-900 rounded-full flex-shrink-0"></span>
                                            <span>{risk}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Historical Data Panel */}
            {historicalData && (
                <div className="bg-white border-2 border-neutral-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="border-b-2 border-neutral-800 bg-neutral-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Historical Analysis</span>
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        <div>
                            <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Analysis Period</div>
                            <div className="text-sm font-bold text-neutral-900">{historicalData.analysisPeriod}</div>
                        </div>

                        {historicalData.summary && (
                            <div className="border-t border-neutral-300 pt-3">
                                <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Summary Statistics</div>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">Shortage Events:</span>
                                        <span className="font-semibold tabular-nums">{historicalData.summary.totalShortageEvents}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">Avg Shortage:</span>
                                        <span className="font-semibold tabular-nums">{historicalData.summary.avgShortageAmount} MT</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {historicalData.seasonalPattern && (
                            <div className="border-t border-neutral-300 pt-3">
                                <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Seasonal Pattern</div>
                                <div className="text-xs bg-neutral-100 border border-neutral-300 px-2 py-2 text-neutral-700">
                                    High Risk: {historicalData.seasonalPattern.highRiskMonths?.join(', ') || 'None identified'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}