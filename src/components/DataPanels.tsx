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
    regionalToolData?: Record<string, Record<string, any>>;
}

export default function DataPanels({
    weatherData,
    marketData,
    warehouseData,
    productionData,
    cropHealthData,
    historicalData,
    regionalToolData
}: DataPanelsProps) {
    
    // If we have regional data, display cards for each region
    if (regionalToolData && Object.keys(regionalToolData).length > 0) {
        return (
            <div className="space-y-6">
                {Object.entries(regionalToolData).map(([region, tools]) => (
                    <div key={region} className="bg-white border-2 border-neutral-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <div className="border-b-2 border-neutral-800 bg-neutral-50 px-6 py-3">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">{region} - Regional Analysis</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Crop Health for Region */}
                                {tools.get_crop_health && (
                                    <div className="bg-white border-2 border-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="border-b-2 border-neutral-800 bg-neutral-50 px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                <Sprout className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Crop Health</span>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div>
                                                <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Health Score</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-2xl font-bold text-neutral-900 tabular-nums">
                                                        {tools.get_crop_health.cropHealthScore || 'N/A'}
                                                    </div>
                                                    <span className="text-xs text-neutral-600">/100</span>
                                                </div>
                                            </div>

                                            <div className="border-t border-neutral-300 pt-3">
                                                <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Condition</div>
                                                <div className={`text-xs px-2 py-1 border-2 font-semibold inline-block ${
                                                    tools.get_crop_health.condition === 'Excellent'
                                                        ? 'bg-green-50 text-green-800 border-green-300'
                                                        : tools.get_crop_health.condition === 'Good'
                                                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                                                        : tools.get_crop_health.condition === 'Fair'
                                                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                                                        : 'bg-red-50 text-red-800 border-red-300'
                                                }`}>
                                                    {tools.get_crop_health.condition}
                                                </div>
                                            </div>

                                            {tools.get_crop_health.metrics && (
                                                <div className="border-t border-neutral-300 pt-3">
                                                    <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Key Metrics</div>
                                                    <div className="space-y-1 text-xs">
                                                        {tools.get_crop_health.metrics.temperature && (
                                                            <div className="flex justify-between">
                                                                <span className="text-neutral-600">Avg Temp:</span>
                                                                <span className="font-semibold tabular-nums">{tools.get_crop_health.metrics.temperature.average}°C</span>
                                                            </div>
                                                        )}
                                                        {tools.get_crop_health.metrics.rainfall && (
                                                            <div className="flex justify-between">
                                                                <span className="text-neutral-600">Rainfall:</span>
                                                                <span className="font-semibold tabular-nums">{tools.get_crop_health.metrics.rainfall.total} mm</span>
                                                            </div>
                                                        )}
                                                        {tools.get_crop_health.metrics.humidity && (
                                                            <div className="flex justify-between">
                                                                <span className="text-neutral-600">Humidity:</span>
                                                                <span className="font-semibold tabular-nums">{tools.get_crop_health.metrics.humidity.average}%</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {tools.get_crop_health.risks && tools.get_crop_health.risks.length > 0 && (
                                                <div className="border-t border-neutral-300 pt-3">
                                                    <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Risk Factors</div>
                                                    <div className="space-y-1">
                                                        {tools.get_crop_health.risks.slice(0, 3).map((risk: string, idx: number) => (
                                                            <div key={idx} className="text-xs text-red-700 bg-red-50 border-l-2 border-red-300 px-2 py-1">
                                                                {risk}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Weather Data for Region */}
                                {tools.get_weather_data && (
                                    <div className="bg-white border-2 border-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="border-b-2 border-neutral-800 bg-neutral-50 px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                <Cloud className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Weather</span>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Temperature</div>
                                                    <div className="text-lg font-bold text-neutral-900 tabular-nums">
                                                        {tools.get_weather_data.current?.temperature || 'N/A'}°C
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Humidity</div>
                                                    <div className="text-lg font-bold text-neutral-900 tabular-nums">
                                                        {tools.get_weather_data.current?.humidity || 'N/A'}%
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-neutral-300 pt-3">
                                                <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Conditions</div>
                                                <div className="text-xs text-neutral-700">{tools.get_weather_data.current?.description || 'N/A'}</div>
                                            </div>

                                            {tools.get_weather_data.agriculturalImpact && (
                                                <div className="border-t border-neutral-300 pt-3">
                                                    <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Ag. Risk</div>
                                                    <div className={`text-xs px-2 py-1 border-2 font-semibold inline-block ${
                                                        tools.get_weather_data.agriculturalImpact.riskLevel === 'High'
                                                            ? 'bg-red-50 text-red-800 border-red-300'
                                                            : tools.get_weather_data.agriculturalImpact.riskLevel === 'Medium'
                                                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                                                            : 'bg-green-50 text-green-800 border-green-300'
                                                    }`}>
                                                        {tools.get_weather_data.agriculturalImpact.riskLevel}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Production Forecast for Region */}
                                {tools.get_production_forecast && (
                                    <div className="bg-white border-2 border-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="border-b-2 border-neutral-800 bg-neutral-50 px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Production</span>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div>
                                                <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Crop</div>
                                                <div className="text-sm font-bold text-neutral-900">{tools.get_production_forecast.crop}</div>
                                            </div>

                                            <div className="border-t border-neutral-300 pt-3">
                                                <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Expected Yield</div>
                                                <div className="flex items-baseline gap-2">
                                                    <div className="text-xl font-bold text-neutral-900 tabular-nums">
                                                        {tools.get_production_forecast.expectedYield?.toLocaleString() || 'N/A'}
                                                    </div>
                                                    <span className="text-xs text-neutral-600">kg/ha</span>
                                                </div>
                                                <div className="text-xs text-neutral-600 mt-1">
                                                    Change: <span className={tools.get_production_forecast.yieldChange?.includes('-') ? 'text-red-600' : 'text-green-600'}>
                                                        {tools.get_production_forecast.yieldChange}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="border-t border-neutral-300 pt-3">
                                                <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Confidence</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-neutral-200 border border-neutral-300">
                                                        <div
                                                            className="h-full bg-neutral-900"
                                                            style={{ width: `${Math.min(100, parseFloat(tools.get_production_forecast.confidenceLevel || '0'))}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold tabular-nums">{tools.get_production_forecast.confidenceLevel}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Warehouse Stock for Region */}
                                {tools.get_warehouse_stock && (
                                    <div className="bg-white border-2 border-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="border-b-2 border-neutral-800 bg-neutral-50 px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                <Warehouse className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Warehouse</span>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div>
                                                <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Stock Status</div>
                                                <div className="text-xs text-neutral-700">{tools.get_warehouse_stock.stockStatus}</div>
                                            </div>

                                            {tools.get_warehouse_stock.capacity && (
                                                <div className="border-t border-neutral-300 pt-3">
                                                    <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Capacity</div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-3 bg-neutral-200 border-2 border-neutral-300">
                                                            <div
                                                                className="h-full bg-neutral-900"
                                                                style={{ width: `${tools.get_warehouse_stock.capacity.utilizationPercent}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold tabular-nums">{tools.get_warehouse_stock.capacity.utilizationPercent}%</span>
                                                    </div>
                                                </div>
                                            )}

                                            {tools.get_warehouse_stock.stocks?.total && (
                                                <div className="border-t border-neutral-300 pt-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-neutral-500 uppercase">Total Stock</span>
                                                        <span className="text-sm font-bold tabular-nums">{tools.get_warehouse_stock.stocks.total.amount.toLocaleString()} MT</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Fallback: Display single-region data panels
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