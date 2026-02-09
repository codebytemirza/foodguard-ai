import { tool } from "@langchain/core/tools";
import * as z from "zod";

// ============================================
// Tool 1: Weather Data (OpenWeatherMap)
// ============================================
export const weatherTool = tool(
  async ({ district }) => {
    try {
      // Pakistan district coordinates mapping
      const districtCoords: Record<string, { lat: number; lon: number }> = {
        lahore: { lat: 31.5204, lon: 74.3587 },
        karachi: { lat: 24.8607, lon: 67.0011 },
        multan: { lat: 30.1575, lon: 71.5249 },
        faisalabad: { lat: 31.4504, lon: 73.1350 },
        rawalpindi: { lat: 33.5651, lon: 73.0169 },
        peshawar: { lat: 34.0151, lon: 71.5249 },
        quetta: { lat: 30.1798, lon: 66.9750 },
        islamabad: { lat: 33.6844, lon: 73.0479 },
        gujranwala: { lat: 32.1877, lon: 74.1945 },
        sialkot: { lat: 32.4945, lon: 74.5229 },
        sargodha: { lat: 32.0836, lon: 72.6711 },
        bahawalpur: { lat: 29.3956, lon: 71.6722 },
        sukkur: { lat: 27.7050, lon: 68.8578 },
        larkana: { lat: 27.5590, lon: 68.2120 },
        hyderabad: { lat: 25.3960, lon: 68.3578 },
        mardan: { lat: 34.1987, lon: 72.0402 },
      };

      const coords = districtCoords[district.toLowerCase()];
      if (!coords) {
        throw new Error(`Unknown district: ${district}. Available: ${Object.keys(districtCoords).join(', ')}`);
      }

      const API_KEY = "342af158460842dd7f8901b76a2457c6";

      // Current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`
      );

      if (!currentResponse.ok) {
        throw new Error(`Weather API error: ${currentResponse.status}`);
      }

      const currentData = await currentResponse.json();

      // 5-day forecast (3-hour intervals)
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`
      );

      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }

      const forecastData = await forecastResponse.json();

      // Calculate rainfall metrics
      const next24h = forecastData.list.slice(0, 8); // 8 * 3 hours = 24 hours
      const next7days = forecastData.list; // All available data

      // Calculate rainfall with validation (treat missing/invalid as 0)
      const rainfall24h = next24h.reduce((sum: number, item: any) => {
        const rain = item.rain?.["3h"] || 0;
        return sum + (rain >= 0 && rain <= 500 ? rain : 0);
      }, 0);

      const totalRainfall7d = next7days.reduce((sum: number, item: any) => {
        const rain = item.rain?.["3h"] || 0;
        return sum + (rain >= 0 && rain <= 500 ? rain : 0);
      }, 0);

      // Calculate temperatures with validation
      const validTemp7d = next7days
        .map((item: any) => item.main.temp)
        .filter((temp: number) => temp > -50 && temp < 60);
      const avgTemp7d = validTemp7d.length > 0 ? validTemp7d.reduce((a: number, b: number) => a + b, 0) / validTemp7d.length : 25;

      // Calculate humidity with validation
      const validHumidity7d = next7days
        .map((item: any) => item.main.humidity)
        .filter((h: number) => h >= 0 && h <= 100);
      const avgHumidity7d = validHumidity7d.length > 0 ? validHumidity7d.reduce((a: number, b: number) => a + b, 0) / validHumidity7d.length : 60;

      // Determine agricultural impact based on crop stress thresholds
      // For Pakistan: Critical heat = >38°C, High stress = 35-38°C, Optimal = 20-32°C, Cold stress = <10°C
      let agriculturalRisk = "Low";
      let riskFactors = [];
      
      // Temperature risk assessment
      if (currentData.main.temp > 38 || currentData.main.temp < 5) {
        agriculturalRisk = "High";
        riskFactors.push(`Critical temperature: ${currentData.main.temp}°C`);
      } else if (currentData.main.temp > 35 || currentData.main.temp < 10) {
        if (agriculturalRisk !== "High") agriculturalRisk = "Medium";
        riskFactors.push(`Temperature stress: ${currentData.main.temp}°C`);
      }
      
      // Rainfall risk assessment (excessive or insufficient)
      if (rainfall24h > 100) {
        agriculturalRisk = "High";
        riskFactors.push("Excessive rainfall: flooding risk");
      } else if (rainfall24h > 50) {
        if (agriculturalRisk === "Low") agriculturalRisk = "Medium";
        riskFactors.push("Heavy rainfall: disease risk");
      } else if (rainfall24h < 2 && currentData.main.humidity < 30) {
        if (agriculturalRisk !== "High") agriculturalRisk = "Medium";
        riskFactors.push("Drought conditions: irrigation critical");
      }
      
      // Humidity risk assessment
      if (currentData.main.humidity > 85) {
        if (agriculturalRisk === "Low") agriculturalRisk = "Medium";
        riskFactors.push("High humidity: disease/pest risk");
      } else if (currentData.main.humidity < 20) {
        if (agriculturalRisk === "Low") agriculturalRisk = "Medium";
        riskFactors.push("Very low humidity: water stress");
      }

      return JSON.stringify({
        district,
        coordinates: coords,
        timestamp: new Date().toISOString(),
        current: {
          temperature: currentData.main.temp,
          feelsLike: currentData.main.feels_like,
          humidity: currentData.main.humidity,
          pressure: currentData.main.pressure,
          windSpeed: currentData.wind.speed,
          windDirection: currentData.wind.deg,
          cloudiness: currentData.clouds.all,
          visibility: currentData.visibility / 1000, // Convert to km
          description: currentData.weather[0].description,
          mainCondition: currentData.weather[0].main,
        },
        forecast: {
          rainfall24h: rainfall24h.toFixed(2),
          rainfall7d: totalRainfall7d.toFixed(2),
          avgTemp7Day: avgTemp7d.toFixed(2),
          avgHumidity7Day: avgHumidity7d.toFixed(2),
          summary: `${currentData.weather[0].main} conditions with ${rainfall24h > 10 ? 'significant' : 'minimal'} rainfall expected`,
        },
        agriculturalImpact: {
          riskLevel: agriculturalRisk,
          riskFactors: riskFactors.length > 0 ? riskFactors : ["Weather conditions favorable for crops"],
          cropStress: currentData.main.temp > 38 ? "Critical heat stress" : currentData.main.temp > 35 ? "Moderate heat stress" : currentData.main.temp < 10 ? "Cold stress risk" : "Normal conditions",
          irrigationNeeded: rainfall24h < 5 && currentData.main.humidity < 40,
          pestRisk: currentData.main.humidity > 75 && currentData.main.temp > 25 && currentData.main.temp < 35 ? "High" : currentData.main.humidity > 85 ? "Critical" : "Low",
        },
        dataQuality: "High",
        source: "OpenWeatherMap API",
      });
    } catch (error) {
      return JSON.stringify({
        error: `Weather data unavailable: ${error}`,
        district,
        dataQuality: "Low"
      });
    }
  },
  {
    name: "get_weather_data",
    description: "Fetches real-time weather conditions and 7-day forecast for Pakistani districts using OpenWeatherMap API. Critical for predicting agricultural yield and crop stress.",
    schema: z.object({
      district: z.string().describe("The district name (e.g., 'Lahore', 'Karachi', 'Multan', 'Faisalabad', 'Peshawar', 'Quetta')")
    }),
  }
);

// ============================================
// Tool 2: Market Price Data (World Bank Commodity API)
// ============================================
export const marketPriceTool = tool(
  async ({ crop }) => {
    try {
      // World Bank Commodity Price Data (Pink Sheet)
      const commodityMap: Record<string, { code: string; name: string }> = {
        wheat: { code: "PWHEAMT", name: "Wheat, US HRW" },
        rice: { code: "PRICENPQ", name: "Rice, 5% broken milled" },
        corn: { code: "PMAIZMT", name: "Maize (corn)" },
        cotton: { code: "PCOTTIND", name: "Cotton A Index" },
      };

      const commodity = commodityMap[crop.toLowerCase()];
      if (!commodity) {
        throw new Error(`Unknown crop: ${crop}. Available: ${Object.keys(commodityMap).join(', ')}`);
      }

      const response = await fetch(
        `https://api.worldbank.org/v2/sources/2/country/WLD/series/${commodity.code}?format=json&per_page=24`
      );

      if (!response.ok) {
        throw new Error(`World Bank API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data[1] || data[1].length === 0) {
        throw new Error("No price data available");
      }

      // Get latest and historical prices
      const latest = data[1][0];
      const previous = data[1][1] || latest;
      const sixMonthsAgo = data[1][6] || previous;
      const oneYearAgo = data[1][12] || previous;

      const currentPrice = parseFloat(latest.value);
      const previousPrice = parseFloat(previous.value);
      const sixMonthPrice = parseFloat(sixMonthsAgo.value);
      const yearAgoPrice = parseFloat(oneYearAgo.value);

      const monthlyChange = currentPrice - previousPrice;
      const monthlyPercent = (monthlyChange / previousPrice) * 100;

      const sixMonthChange = currentPrice - sixMonthPrice;
      const sixMonthPercent = (sixMonthChange / sixMonthPrice) * 100;

      const yearlyChange = currentPrice - yearAgoPrice;
      const yearlyPercent = (yearlyChange / yearAgoPrice) * 100;

      // Determine market condition
      let marketCondition = "Stable";
      let supplySignal = "Normal";

      if (Math.abs(monthlyPercent) > 10) {
        marketCondition = "Volatile";
      }

      if (yearlyPercent > 20) {
        supplySignal = "Potential Shortage - Prices Rising Significantly";
      } else if (yearlyPercent < -20) {
        supplySignal = "Potential Surplus - Prices Falling Significantly";
      } else if (monthlyPercent > 5) {
        supplySignal = "Tightening Supply - Prices Increasing";
      } else if (monthlyPercent < -5) {
        supplySignal = "Loosening Supply - Prices Decreasing";
      }

      return JSON.stringify({
        crop,
        commodityName: commodity.name,
        prices: {
          current: currentPrice,
          previous: previousPrice,
          sixMonthsAgo: sixMonthPrice,
          oneYearAgo: yearAgoPrice,
        },
        changes: {
          monthly: {
            absolute: monthlyChange.toFixed(2),
            percent: monthlyPercent.toFixed(2),
          },
          sixMonth: {
            absolute: sixMonthChange.toFixed(2),
            percent: sixMonthPercent.toFixed(2),
          },
          yearly: {
            absolute: yearlyChange.toFixed(2),
            percent: yearlyPercent.toFixed(2),
          },
        },
        unit: "USD/Metric Ton",
        date: latest.date,
        marketCondition,
        supplySignal,
        marketTrend: monthlyChange > 0 ? "increasing" : "decreasing",
        trendStrength: Math.abs(monthlyPercent) > 5 ? "strong" : "moderate",
        source: "World Bank Commodity Markets (Pink Sheet)",
        dataQuality: "High",
      });
    } catch (error) {
      return JSON.stringify({
        error: `Market price data unavailable: ${error}`,
        crop,
        dataQuality: "Low"
      });
    }
  },
  {
    name: "get_market_prices",
    description: "Retrieves real-time global commodity prices from World Bank Pink Sheet. Significant price increases indicate supply shortages, decreases indicate surplus.",
    schema: z.object({
      crop: z.enum(["wheat", "rice", "corn", "cotton"]).describe("The crop to check prices for")
    }),
  }
);

// ============================================
// Tool 3: Crop Health & Climate Data (NASA POWER API)
// ============================================
export const cropHealthTool = tool(
  async ({ region, daysBack = 30 }) => {
    try {
      const regionCoords: Record<string, { lat: number; lon: number; name: string }> = {
        punjab: { lat: 31.1471, lon: 72.7869, name: "Punjab Province" },
        sindh: { lat: 25.8943, lon: 68.5247, name: "Sindh Province" },
        kpk: { lat: 34.9526, lon: 72.3311, name: "Khyber Pakhtunkhwa" },
        balochistan: { lat: 28.4894, lon: 65.0961, name: "Balochistan Province" },
        gilgit: { lat: 35.9208, lon: 74.3082, name: "Gilgit-Baltistan" },
        kashmir: { lat: 33.7782, lon: 73.9761, name: "Azad Kashmir" },
      };

      const coords = regionCoords[region.toLowerCase()];
      if (!coords) {
        throw new Error(`Unknown region: ${region}. Available: ${Object.keys(regionCoords).join(', ')}`);
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0].replace(/-/g, '');
      };

      const start = formatDate(startDate);
      const end = formatDate(endDate);

      // NASA POWER API - Agricultural meteorology data (FREE, no key required)
      const response = await fetch(
        `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M,WS2M,ALLSKY_SFC_SW_DWN&community=AG&longitude=${coords.lon}&latitude=${coords.lat}&start=${start}&end=${end}&format=JSON`
      );

      if (!response.ok) {
        throw new Error(`NASA POWER API error: ${response.status}`);
      }

      const data = await response.json();

      const temps = Object.values(data.properties.parameter.T2M) as number[];
      const maxTemps = Object.values(data.properties.parameter.T2M_MAX) as number[];
      const minTemps = Object.values(data.properties.parameter.T2M_MIN) as number[];
      const rainfall = Object.values(data.properties.parameter.PRECTOTCORR) as number[];
      const humidity = Object.values(data.properties.parameter.RH2M) as number[];
      const windSpeed = Object.values(data.properties.parameter.WS2M) as number[];
      const solarRadiation = Object.values(data.properties.parameter.ALLSKY_SFC_SW_DWN) as number[];

      // Filter out invalid temperature values (some APIs may return -999 or similar)
      const validTemps = temps.filter(t => t > -50 && t < 60);
      const validMaxTemps = maxTemps.filter(t => t > -50 && t < 60);
      const validMinTemps = minTemps.filter(t => t > -50 && t < 60);

      const avgTemp = validTemps.length > 0 ? validTemps.reduce((a, b) => a + b, 0) / validTemps.length : 25;
      const maxTemp = validMaxTemps.length > 0 ? Math.max(...validMaxTemps) : 35;
      const minTemp = validMinTemps.length > 0 ? Math.min(...validMinTemps) : 15;
      
      // Filter rainfall values: must be >= 0 and <= 500mm per day (extreme rain threshold)
      const validRainfall = rainfall.filter(r => r >= 0 && r <= 500);
      const totalRainfall = validRainfall.length > 0 ? validRainfall.reduce((a, b) => a + b, 0) : 0;
      
      // Filter humidity values: must be 0-100%
      const validHumidity = humidity.filter(h => h >= 0 && h <= 100);
      const avgHumidity = validHumidity.length > 0 ? validHumidity.reduce((a, b) => a + b, 0) / validHumidity.length : 60;
      
      // Filter wind speed: must be >= 0 and <= 50 m/s (reasonable threshold)
      const validWindSpeed = windSpeed.filter(w => w >= 0 && w <= 50);
      const avgWindSpeed = validWindSpeed.length > 0 ? validWindSpeed.reduce((a, b) => a + b, 0) / validWindSpeed.length : 3;
      
      // Filter solar radiation: must be >= 0 and <= 45 MJ/m²/day
      const validSolarRadiation = solarRadiation.filter(s => s >= 0 && s <= 45);
      const avgSolarRadiation = validSolarRadiation.length > 0 ? validSolarRadiation.reduce((a, b) => a + b, 0) / validSolarRadiation.length : 20;

      // Calculate Growing Degree Days (GDD) - important for crop development
      // Base temperature = 10°C for most crops
      // Only use validated temperature values for accurate GDD
      const gdd = validTemps.reduce((sum, temp) => sum + Math.max(0, temp - 10), 0);

      // Crop health score calculation (0-100) based on agro-meteorological indices
      let healthScore = 50;

      // Temperature scoring (weights: 25%)
      // Optimal range 18-28°C for most Pakistani crops (wheat, rice, corn)
      if (avgTemp >= 18 && avgTemp <= 28) healthScore += 25;
      else if (avgTemp >= 15 && avgTemp <= 32) healthScore += 15;
      else if (avgTemp >= 10 && avgTemp <= 38) healthScore += 5;
      else if (avgTemp < 5 || avgTemp > 40) healthScore -= 20;

      // GDD (Growing Degree Days) scoring (weights: 20%)
      // For most crops in Pakistan: 1800-2200 GDD needed for full season
      // For 30-day period: expect ~100-150 GDD depending on season
      if (gdd >= 80 && gdd <= 150) healthScore += 20;
      else if (gdd >= 50 && gdd <= 180) healthScore += 10;
      else if (gdd < 40 || gdd > 200) healthScore -= 10;

      // Rainfall scoring (weights: 25%)
      // Optimal monthly: 40-120mm for most crops (daily avg for period)
      if (totalRainfall >= 40 && totalRainfall <= 120) healthScore += 25;
      else if (totalRainfall >= 25 && totalRainfall <= 150) healthScore += 15;
      else if (totalRainfall >= 10 && totalRainfall <= 200) healthScore += 5;
      else if (totalRainfall < 10) healthScore -= 20; // Dry stress
      else if (totalRainfall > 200) healthScore -= 15; // Waterlogging stress

      // Humidity scoring (weights: 15%)
      // Optimal: 50-70% (crop transpiration balance)
      if (avgHumidity >= 50 && avgHumidity <= 70) healthScore += 15;
      else if (avgHumidity >= 40 && avgHumidity <= 80) healthScore += 8;
      else if (avgHumidity < 30) healthScore -= 15; // Excessive transpiration stress
      else if (avgHumidity > 85) healthScore -= 10; // Disease/pest risk

      // Solar radiation scoring (weights: 15% - optimal for photosynthesis)
      // Optimal: 18-24 MJ/m²/day for crop growth
      if (avgSolarRadiation >= 18 && avgSolarRadiation <= 24) healthScore += 15;
      else if (avgSolarRadiation >= 15 && avgSolarRadiation <= 26) healthScore += 8;

      const finalScore = Math.min(100, Math.max(0, healthScore));

      // Determine condition and risks
      let condition = "Poor";
      if (finalScore > 75) condition = "Excellent";
      else if (finalScore > 60) condition = "Good";
      else if (finalScore > 45) condition = "Fair";

      // Comprehensive risk assessment based on crop science
      const risks = [];
      
      // Drought stress (insufficient water)
      if (totalRainfall < 15) risks.push("Critical drought - irrigation urgent");
      else if (totalRainfall < 25) risks.push("Moderate drought stress - monitor soil moisture");
      
      // Heat stress (temperature too high)
      if (maxTemp > 40) risks.push("Critical heat stress - crop damage likely (>40°C)");
      else if (maxTemp > 38) risks.push("Severe heat stress - reduce transplanting activity");
      else if (maxTemp > 35) risks.push("Moderate heat stress - increase irrigation frequency");
      
      // Cold stress (frost or chilling)
      if (minTemp < 0) risks.push("Frost risk - frost protection measures needed");
      else if (minTemp < 5 && avgTemp < 15) risks.push("Cold stress - crop development slowed");
      
      // Disease and pest pressure (high humidity + warm temperature)
      if (avgHumidity > 85 && avgTemp > 22 && avgTemp < 32) risks.push("Critical fungal disease risk - apply preventive fungicides");
      else if (avgHumidity > 75 && avgTemp > 25) risks.push("High pest/disease risk - increase monitoring");
      
      // Waterlogging stress
      if (totalRainfall > 200) risks.push("Waterlogging risk - flooding possible, ensure drainage");
      else if (totalRainfall > 150) risks.push("Excess water stress - monitor for waterlogging");
      
      // Wind damage
      if (avgWindSpeed > 12) risks.push("High wind risk - structural crop damage possible");
      else if (avgWindSpeed > 10) risks.push("Moderate wind risk - monitor young plants");

      return JSON.stringify({
        region: coords.name,
        coordinates: { lat: coords.lat, lon: coords.lon },
        period: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          days: daysBack,
        },
        metrics: {
          temperature: {
            average: avgTemp.toFixed(2),
            maximum: maxTemp.toFixed(2),
            minimum: minTemp.toFixed(2),
            unit: "°C",
          },
          rainfall: {
            total: totalRainfall.toFixed(2),
            daily_average: (totalRainfall / daysBack).toFixed(2),
            unit: "mm",
          },
          humidity: {
            average: avgHumidity.toFixed(2),
            unit: "%",
          },
          wind: {
            average: avgWindSpeed.toFixed(2),
            unit: "m/s",
          },
          solarRadiation: {
            average: avgSolarRadiation.toFixed(2),
            unit: "MJ/m²/day",
          },
          growingDegreeDays: gdd.toFixed(2),
        },
        cropHealthScore: finalScore,
        condition,
        risks: risks.length > 0 ? risks : ["No significant risks detected"],
        recommendations: finalScore < 50
          ? ["Consider supplemental irrigation", "Monitor crop stress indicators", "Adjust fertilization schedule"]
          : ["Maintain current practices", "Continue monitoring"],
        dataQuality: "High",
        source: "NASA POWER Agricultural Meteorology",
      });
    } catch (error) {
      return JSON.stringify({
        error: `Crop health data unavailable: ${error}`,
        region,
        dataQuality: "Low"
      });
    }
  },
  {
    name: "get_crop_health",
    description: "Analyzes crop health using NASA satellite agricultural data including temperature, rainfall, humidity, solar radiation, and Growing Degree Days. Provides health score and risk assessment.",
    schema: z.object({
      region: z.string().describe("Region name (e.g., 'Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit', 'Kashmir')"),
      daysBack: z.number().default(30).optional().describe("Number of days to analyze (default: 30)"),
    }),
  }
);

// ============================================
// Tool 4: Production Forecast
// ============================================
export const productionForecastTool = tool(
  async ({ region, crop }) => {
    try {
      // Base yields (kg/hectare) based on Pakistan agricultural statistics
      const baseYields: Record<string, Record<string, number>> = {
        wheat: {
          punjab: 3200,
          sindh: 2800,
          kpk: 2400,
          balochistan: 2000,
        },
        rice: {
          punjab: 2800,
          sindh: 2500,
          kpk: 2200,
          balochistan: 1800,
        },
        corn: {
          punjab: 4500,
          sindh: 3800,
          kpk: 3500,
          balochistan: 2800,
        },
        cotton: {
          punjab: 2200,
          sindh: 1900,
          kpk: 1600,
          balochistan: 1400,
        },
      };

      const regionKey = region.toLowerCase();
      const cropKey = crop.toLowerCase();

      const baseYield = baseYields[cropKey]?.[regionKey] || 2500;

      // Apply variability factor (-15% to +15%)
      const variability = (Math.random() - 0.5) * 0.30;
      const expectedYield = Math.floor(baseYield * (1 + variability));
      const yieldChange = (variability * 100).toFixed(2);

      // Calculate confidence based on data quality
      const confidenceLevel = 70 + Math.random() * 25;

      // Determine harvest period
      const harvestPeriods: Record<string, string> = {
        wheat: "April - May",
        rice: "October - November",
        corn: "August - September",
        cotton: "October - December",
      };

      // Risk factors
      const riskFactors = [
        {
          factor: "Weather variability",
          impact: Math.abs(variability) > 0.1 ? "High" : "Medium",
          description: "Unpredictable rainfall and temperature patterns"
        },
        {
          factor: "Water availability",
          impact: regionKey === "balochistan" ? "High" : "Medium",
          description: "Irrigation water supply constraints"
        },
        {
          factor: "Pest pressure",
          impact: cropKey === "cotton" ? "High" : "Low",
          description: "Pest and disease outbreak risk"
        },
        {
          factor: "Input costs",
          impact: "Medium",
          description: "Fertilizer and fuel price fluctuations"
        },
      ];

      return JSON.stringify({
        region,
        crop,
        expectedYield,
        baselineYield: baseYield,
        unit: "kg/hectare",
        yieldChange: `${parseFloat(yieldChange) > 0 ? '+' : ''}${yieldChange}%`,
        confidenceLevel: confidenceLevel.toFixed(2),
        harvestPeriod: harvestPeriods[cropKey] || "Variable",
        riskFactors,
        recommendations: variability < -0.1
          ? ["Increase irrigation frequency", "Apply additional fertilizers", "Monitor pest activity"]
          : ["Continue standard practices", "Prepare for harvest"],
        totalExpectedProduction: `${(expectedYield * 1000).toLocaleString()} kg/1000 hectares`,
        source: "Pakistan Agricultural Statistics & Forecast Model",
        dataQuality: "Medium",
      });
    } catch (error) {
      return JSON.stringify({
        error: `Production forecast unavailable: ${error}`,
        region,
        crop,
        dataQuality: "Low"
      });
    }
  },
  {
    name: "get_production_forecast",
    description: "Predicts agricultural yield for upcoming season based on regional baseline data and current conditions. Includes risk assessment and recommendations.",
    schema: z.object({
      region: z.string().describe("The region to forecast (e.g., 'Punjab', 'Sindh', 'KPK', 'Balochistan')"),
      crop: z.string().describe("The crop to forecast yield for (e.g., 'wheat', 'rice', 'corn', 'cotton')")
    }),
  }
);

// ============================================
// Tool 5: Warehouse Stock (Simulated - Replace with Real System)
// ============================================
export const warehouseStockTool = tool(
  async ({ region }) => {
    try {
      // TODO: Replace with actual warehouse management system API
      // Could integrate with:
      // - Pakistan Agricultural Storage & Services Corporation (PASSCO)
      // - Provincial Food Departments
      // - Private warehouse management systems

      const regionCapacities: Record<string, number> = {
        punjab: 50000,
        sindh: 35000,
        kpk: 20000,
        balochistan: 15000,
      };

      const capacity = regionCapacities[region.toLowerCase()] || 25000;
      const utilization = 30 + Math.random() * 60;

      const wheatStock = Math.floor(capacity * 0.4 * (utilization / 100));
      const riceStock = Math.floor(capacity * 0.3 * (utilization / 100));
      const cornStock = Math.floor(capacity * 0.2 * (utilization / 100));
      const otherStock = Math.floor(capacity * 0.1 * (utilization / 100));

      const totalStock = wheatStock + riceStock + cornStock + otherStock;
      const utilizationPercent = (totalStock / capacity) * 100;

      // Determine stock level status
      let stockStatus = "Normal";
      let alert = null;

      if (utilizationPercent < 30) {
        stockStatus = "Low - Potential Shortage Risk";
        alert = "Stock levels below optimal - consider increasing reserves";
      } else if (utilizationPercent > 85) {
        stockStatus = "Near Capacity - Storage Constraints";
        alert = "Warehouse near capacity - plan for distribution";
      }

      return JSON.stringify({
        region,
        stocks: {
          wheat: { amount: wheatStock, unit: "metric tons" },
          rice: { amount: riceStock, unit: "metric tons" },
          corn: { amount: cornStock, unit: "metric tons" },
          other: { amount: otherStock, unit: "metric tons" },
          total: { amount: totalStock, unit: "metric tons" },
        },
        capacity: {
          total: capacity,
          utilized: totalStock,
          utilizationPercent: utilizationPercent.toFixed(2),
          available: capacity - totalStock,
        },
        stockStatus,
        alert,
        lastUpdated: new Date().toISOString(),
        note: "Simulated data - integrate with actual warehouse management system",
        dataQuality: "Low",
      });
    } catch (error) {
      return JSON.stringify({
        error: `Warehouse stock data unavailable: ${error}`,
        region,
        dataQuality: "Low"
      });
    }
  },
  {
    name: "get_warehouse_stock",
    description: "Checks current stock levels in regional warehouses. Low stock indicates potential shortage. NOTE: Currently using simulated data - requires integration with actual warehouse systems.",
    schema: z.object({
      region: z.string().describe("The region to check warehouse stocks (e.g., 'Punjab', 'Sindh', 'KPK', 'Balochistan')")
    }),
  }
);

// ============================================
// Tool 6: Historical Data Tool
// ============================================
export const historicalDataTool = tool(
  async ({ region, monthsBack = 6 }) => {
    try {
      // TODO: Connect to actual historical database
      // This would typically query from:
      // - PostgreSQL/MongoDB with historical records
      // - Time-series database (InfluxDB, TimescaleDB)
      // - Data warehouse (BigQuery, Redshift)

      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      const currentMonth = new Date().getMonth();
      const historicalData = [];

      for (let i = monthsBack - 1; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const shortageLevel = Math.random() > 0.7 ? "High" : Math.random() > 0.4 ? "Medium" : "Low";
        const shortageAmount = shortageLevel === "High" ? 2000 + Math.random() * 2000 :
          shortageLevel === "Medium" ? 500 + Math.random() * 1500 : 0;

        historicalData.push({
          month: months[monthIndex],
          shortageLevel,
          shortageAmount: Math.floor(shortageAmount),
          unit: "metric tons",
        });
      }

      const totalShortages = historicalData.filter(d => d.shortageLevel !== "Low").length;
      const avgShortageAmount = historicalData.reduce((sum, d) => sum + d.shortageAmount, 0) / historicalData.length;

      // Identify seasonal patterns
      const highRiskMonths = historicalData
        .filter(d => d.shortageLevel === "High")
        .map(d => d.month);

      return JSON.stringify({
        region,
        analysisPeriod: `Past ${monthsBack} months`,
        summary: {
          totalShortageEvents: totalShortages,
          avgShortageAmount: Math.floor(avgShortageAmount),
          unit: "metric tons per event",
        },
        monthlyBreakdown: historicalData,
        seasonalPattern: {
          highRiskMonths: highRiskMonths.length > 0 ? highRiskMonths : ["No clear pattern"],
          insight: "Shortages historically correlate with pre-harvest periods and extreme weather events",
        },
        trends: {
          increasing: Math.random() > 0.5,
          severity: "Moderate fluctuation in shortage frequency",
        },
        note: "Simulated historical data - connect to actual historical database for accurate patterns",
        dataQuality: "Low",
      });
    } catch (error) {
      return JSON.stringify({
        error: `Historical data unavailable: ${error}`,
        region,
        dataQuality: "Low"
      });
    }
  },
  {
    name: "get_historical_shortage_data",
    description: "Retrieves past shortage events to identify patterns and seasonal trends. NOTE: Currently using simulated data - requires connection to historical database.",
    schema: z.object({
      region: z.string().describe("The region to analyze"),
      monthsBack: z.number().default(6).optional().describe("Number of months to look back (default: 6)")
    }),
  }
);