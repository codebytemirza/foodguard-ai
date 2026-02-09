"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "./ui/input";
import { Loader2, MapPin, TrendingUp, AlertTriangle, CheckCircle2, XCircle, BarChart3, Database, FileText, MessageSquare, Send, X, Minimize2, Maximize2 } from "lucide-react";
import dynamic from "next/dynamic";
import DataPanels from "@/components/DataPanels";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

interface AnalysisProgress {
    type: "status" | "tool_start" | "tool_end" | "tool_data" | "thinking" | "complete" | "error";
    tool?: string;
    toolName?: string;
    message?: string;
    report?: any;
    data?: any;
    toolData?: Record<string, any>;
    error?: string;
}

interface Region {
    name: string;
    riskLevel: "Critical" | "High" | "Medium" | "Low";
    confidenceScore: number;
    shortageAmount: number;
    recommendedAction: string;
    coordinates: { lat: number; lng: number };
    affectedCrops?: string[];
    keyFactors?: string[];
}

interface DataSnapshot {
    weatherData?: any;
    marketData?: any;
    warehouseData?: any;
    productionData?: any;
    cropHealthData?: any;
    historicalData?: any;
    regionalToolData?: Record<string, Record<string, any>>;
}

export default function Dashboard() {
    const [report, setReport] = useState<any>(null);
    const [progress, setProgress] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedRegions, setSelectedRegions] = useState<string[]>(["Lahore", "Karachi", "Multan"]);
    const [error, setError] = useState<string | null>(null);
    const [dataSnapshot, setDataSnapshot] = useState<DataSnapshot>({});
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMinimized, setChatMinimized] = useState(false);
    const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const chatScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [progress]);

    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const REGIONS = [
        { name: "Lahore", icon: MapPin },
        { name: "Karachi", icon: MapPin },
        { name: "Multan", icon: MapPin },
        { name: "Peshawar", icon: MapPin },
        { name: "Quetta", icon: MapPin },
        { name: "Islamabad", icon: MapPin },
        { name: "Faisalabad", icon: MapPin },
        { name: "Rawalpindi", icon: MapPin },
    ];

    const startAnalysis = async () => {
        setIsAnalyzing(true);
        setProgress([]);
        setReport(null);
        setError(null);
        setDataSnapshot({});

        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    regions: selectedRegions,
                    dateRange: "next 30 days",
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const jsonStr = line.slice(6);
                            if (!jsonStr.trim()) continue;
                            const data: AnalysisProgress = JSON.parse(jsonStr);

                            if (data.type === "status" && data.message) {
                                setProgress((prev) => [...prev, data.message!]);
                            }
                            if (data.type === "tool_start" && data.message) {
                                setProgress((prev) => [...prev, data.message!]);
                            }
                            if (data.type === "tool_data" && data.toolName && data.data) {
                                // Update static data panels with fetched tool data
                                setDataSnapshot((prev) => {
                                    const newSnapshot = { ...prev };

                                    switch (data.toolName) {
                                        case 'get_weather_data':
                                            newSnapshot.weatherData = data.data;
                                            break;
                                        case 'get_market_prices':
                                            newSnapshot.marketData = data.data;
                                            break;
                                        case 'get_warehouse_stock':
                                            newSnapshot.warehouseData = data.data;
                                            break;
                                        case 'get_production_forecast':
                                            newSnapshot.productionData = data.data;
                                            break;
                                        case 'get_crop_health':
                                            newSnapshot.cropHealthData = data.data;
                                            break;
                                        case 'get_historical_shortage_data':
                                            newSnapshot.historicalData = data.data;
                                            break;
                                    }

                                    return newSnapshot;
                                });
                            }
                            if (data.type === "tool_end" && data.message) {
                                setProgress((prev) => [...prev, data.message!]);
                            }
                            if (data.type === "thinking" && data.message) {
                                setProgress((prev) => [...prev, data.message!]);
                            }
                            if (data.type === "complete" && data.report) {
                                setReport(data.report);

                                // Also update data snapshot if toolData is included
                                if (data.toolData) {
                                    setDataSnapshot((prev) => ({
                                        ...prev,
                                        weatherData: (data.toolData && data.toolData.get_weather_data) || prev.weatherData,
                                        marketData: (data.toolData && data.toolData.get_market_prices) || prev.marketData,
                                        warehouseData: (data.toolData && data.toolData.get_warehouse_stock) || prev.warehouseData,
                                        productionData: (data.toolData && data.toolData.get_production_forecast) || prev.productionData,
                                        cropHealthData: (data.toolData && data.toolData.get_crop_health) || prev.cropHealthData,
                                        historicalData: (data.toolData && data.toolData.get_historical_shortage_data) || prev.historicalData,
                                    }));
                                }

                                // Update with regional data if available
                                if (data.regionalToolData) {
                                    setDataSnapshot((prev) => ({
                                        ...prev,
                                        regionalToolData: data.regionalToolData
                                    }));
                                }

                                setProgress((prev) => [...prev, "[COMPLETE] ANALYSIS FINISHED SUCCESSFULLY"]);
                            }
                            if (data.type === "error" && data.error) {
                                setError(data.error);
                                setProgress((prev) => [...prev, `[ERROR] ${data.error}`]);
                            }
                        } catch (e) {
                            console.error("Parse error:", e);
                        }
                    }
                }
            }
        } catch (err: any) {
            const errorMsg = err.message || "Unknown connection error";
            setError(errorMsg);
            setProgress((prev) => [...prev, errorMsg]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const toggleRegion = (regionName: string) => {
        setSelectedRegions((prev) =>
            prev.includes(regionName)
                ? prev.filter((r) => r !== regionName)
                : [...prev, regionName]
        );
    };

    const getRiskBadgeClass = (risk: string) => {
        switch (risk) {
            case "Critical":
                return "bg-red-50 text-red-800 border-red-300";
            case "High":
                return "bg-orange-50 text-orange-800 border-orange-300";
            case "Medium":
                return "bg-amber-50 text-amber-800 border-amber-300";
            case "Low":
                return "bg-green-50 text-green-800 border-green-300";
            default:
                return "bg-gray-50 text-gray-800 border-gray-300";
        }
    };

    const getRiskIcon = (risk: string) => {
        switch (risk) {
            case "Critical":
                return <XCircle className="w-3.5 h-3.5" />;
            case "High":
                return <AlertTriangle className="w-3.5 h-3.5" />;
            case "Medium":
                return <TrendingUp className="w-3.5 h-3.5" />;
            case "Low":
                return <CheckCircle2 className="w-3.5 h-3.5" />;
            default:
                return null;
        }
    };

    const sendChatMessage = async () => {
        if (!chatInput.trim()) return;

        const userMessage = chatInput.trim();
        setChatInput("");
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setChatLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    chatHistory: chatMessages,
                    reportContext: report
                })
            });

            if (!response.ok) {
                throw new Error('Chat API error');
            }

            const data = await response.json();

            if (data.success) {
                setChatMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.response
                }]);
            } else {
                setChatMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "I apologize, but I encountered an error processing your request. Please try again."
                }]);
            }
        } catch (err) {
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: "Error connecting to the assistant. Please check your connection and try again."
            }]);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-100">
            <div className="container mx-auto p-6 space-y-6 max-w-[1400px]">
                {/* Header */}
                <div className="bg-white border-2 border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="border-b-2 border-neutral-800 bg-neutral-50 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-neutral-800 border-2 border-neutral-900">
                                    <Database className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-neutral-900 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                                        FOODGUARD AI
                                    </h1>
                                    <p className="text-sm text-neutral-600 mt-0.5" style={{ fontFamily: 'Georgia, serif' }}>
                                        National Food Supply Prediction & Risk Analysis System
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-neutral-500 uppercase tracking-wider">Report Date</div>
                                <div className="text-sm font-semibold text-neutral-900">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <Button
                                    onClick={startAnalysis}
                                    disabled={isAnalyzing || selectedRegions.length === 0}
                                    className="bg-neutral-900 hover:bg-neutral-800 text-white border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Analyzing
                                        </>
                                    ) : (
                                        <>
                                            <BarChart3 className="w-4 h-4 mr-2" />
                                            Initiate Analysis
                                        </>
                                    )}
                                </Button>

                                <div className="text-sm text-neutral-700 font-medium">
                                    {selectedRegions.length} Region{selectedRegions.length !== 1 ? "s" : ""} Selected
                                </div>
                            </div>

                            <div className="border-2 border-neutral-300 bg-neutral-50 p-4">
                                <label className="text-xs font-bold text-neutral-700 mb-3 block uppercase tracking-wider">
                                    Regional Selection Matrix
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {REGIONS.map((region) => {
                                        const Icon = region.icon;
                                        return (
                                            <button
                                                key={region.name}
                                                className={`px-4 py-2 text-sm font-medium border-2 transition-all ${selectedRegions.includes(region.name)
                                                    ? "bg-neutral-900 text-white border-neutral-900"
                                                    : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900"
                                                    }`}
                                                onClick={() => toggleRegion(region.name)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-3.5 h-3.5" />
                                                    {region.name}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert className="border-2 border-red-800 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-800" />
                        <AlertDescription className="text-red-900 font-medium">{error}</AlertDescription>
                    </Alert>
                )}

                {/* Static Data Panels */}
                <DataPanels {...dataSnapshot} />

                {/* Live Progress */}
                {progress.length > 0 && (
                    <div className="bg-white border-2 border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="border-b-2 border-neutral-800 bg-neutral-50 px-6 py-3">
                            <div className="flex items-center gap-2">
                                <Loader2 className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
                                <span className="text-sm font-bold uppercase tracking-wider">System Operations Log</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <div
                                ref={scrollRef}
                                className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs bg-neutral-900 text-green-400 p-4 border-2 border-neutral-800"
                            >
                                {progress.map((msg, i) => (
                                    <div key={i} className="flex gap-2">
                                        <span className="text-neutral-500">[{new Date().toLocaleTimeString()}]</span>
                                        <span>{msg}</span>
                                    </div>
                                ))}
                                {isAnalyzing && <div className="animate-pulse">_</div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Overall Summary */}
                {report && (
                    <div className="bg-white border-2 border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="border-b-2 border-neutral-800 bg-neutral-50 px-6 py-3">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm font-bold uppercase tracking-wider">Executive Summary</span>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">Overall Risk Assessment:</span>
                                    <Badge className={`${getRiskBadgeClass(report.overallRiskLevel)} flex items-center gap-1.5 px-3 py-1 border-2 font-semibold text-xs uppercase`}>
                                        {getRiskIcon(report.overallRiskLevel)}
                                        {report.overallRiskLevel}
                                    </Badge>
                                </div>
                                <p className="text-sm text-neutral-700 leading-relaxed border-l-4 border-neutral-800 pl-4" style={{ fontFamily: 'Georgia, serif' }}>
                                    {report.summary}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Map View */}
                {report && report.regions && (
                    <div className="bg-white border-2 border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="border-b-2 border-neutral-800 bg-neutral-50 px-6 py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm font-bold uppercase tracking-wider">Regional Risk Cartography</span>
                                </div>
                                <span className="text-xs text-neutral-600">Geospatial Analysis</span>
                            </div>
                        </div>
                        <div className="p-6">
                            <MapView regions={report.regions} />
                        </div>
                    </div>
                )}

                {/* Results Table */}
                {report && report.regions && (
                    <div className="bg-white border-2 border-neutral-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="border-b-2 border-neutral-800 bg-neutral-50 px-6 py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4" />
                                    <span className="text-sm font-bold uppercase tracking-wider">Comprehensive Regional Data Matrix</span>
                                </div>
                                <span className="text-xs text-neutral-600">{report.regions.length} Region{report.regions.length !== 1 ? "s" : ""} Analyzed</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b-2 border-neutral-800 bg-neutral-100">
                                        <th className="text-left p-4 font-bold uppercase tracking-wider text-neutral-700">Region</th>
                                        <th className="text-left p-4 font-bold uppercase tracking-wider text-neutral-700">Risk Classification</th>
                                        <th className="text-left p-4 font-bold uppercase tracking-wider text-neutral-700">Shortage Volume</th>
                                        <th className="text-left p-4 font-bold uppercase tracking-wider text-neutral-700">Confidence Index</th>
                                        <th className="text-left p-4 font-bold uppercase tracking-wider text-neutral-700">Prescribed Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.regions.map((region: Region, i: number) => (
                                        <tr
                                            key={i}
                                            className={`border-b border-neutral-300 ${i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}`}
                                        >
                                            <td className="p-4">
                                                <div className="font-bold text-neutral-900">{region.name}</div>
                                                {region.affectedCrops && region.affectedCrops.length > 0 && (
                                                    <div className="text-xs text-neutral-500 mt-1">
                                                        {region.affectedCrops.join(", ")}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <Badge className={`${getRiskBadgeClass(region.riskLevel)} flex items-center gap-1.5 w-fit px-3 py-1 border-2 font-semibold uppercase text-xs`}>
                                                    {getRiskIcon(region.riskLevel)}
                                                    {region.riskLevel}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-neutral-900 tabular-nums">
                                                    {region.shortageAmount.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-neutral-500">metric tons</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-2 bg-neutral-200 border border-neutral-300">
                                                        <div
                                                            className="h-full bg-neutral-900"
                                                            style={{ width: `${region.confidenceScore}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold tabular-nums">{region.confidenceScore}%</span>
                                                </div>
                                            </td>
                                            <td className="p-4 max-w-sm">
                                                <p className="text-xs text-neutral-700 leading-relaxed">{region.recommendedAction}</p>
                                                {region.keyFactors && region.keyFactors.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {region.keyFactors.slice(0, 2).map((factor, idx) => (
                                                            <span key={idx} className="text-xs px-2 py-0.5 bg-neutral-200 text-neutral-700 border border-neutral-300">
                                                                {factor}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Metadata Footer */}
                {report && report.metadata && (
                    <div className="bg-neutral-50 border-2 border-neutral-300 p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                                <div className="font-bold text-neutral-500 uppercase tracking-wider mb-1">Report ID</div>
                                <div className="font-mono text-neutral-900">{report.reportId}</div>
                            </div>
                            <div>
                                <div className="font-bold text-neutral-500 uppercase tracking-wider mb-1">Generated</div>
                                <div className="text-neutral-900">{report.generatedAt}</div>
                            </div>
                            <div>
                                <div className="font-bold text-neutral-500 uppercase tracking-wider mb-1">Model Version</div>
                                <div className="text-neutral-900">{report.metadata.modelVersion}</div>
                            </div>
                            <div>
                                <div className="font-bold text-neutral-500 uppercase tracking-wider mb-1">Execution Time</div>
                                <div className="text-neutral-900 tabular-nums">{(report.metadata.executionTimeMs / 1000).toFixed(2)}s</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Chatbot */}
            {!chatOpen && (
                <button
                    onClick={() => setChatOpen(true)}
                    className="fixed bottom-6 right-6 p-4 bg-neutral-900 text-white border-2 border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                    <MessageSquare className="w-6 h-6" />
                </button>
            )}

            {chatOpen && (
                <div className={`fixed bottom-6 right-6 bg-white border-2 border-neutral-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all ${chatMinimized ? 'w-80' : 'w-96 h-[600px]'} flex flex-col`}>
                    <div className="border-b-2 border-neutral-900 bg-neutral-50 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-wider">Analysis Assistant</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setChatMinimized(!chatMinimized)}
                                className="p-1 hover:bg-neutral-200 transition-colors"
                            >
                                {chatMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => setChatOpen(false)}
                                className="p-1 hover:bg-neutral-200 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {!chatMinimized && (
                        <>
                            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50">
                                {chatMessages.length === 0 && (
                                    <div className="text-xs text-neutral-500 text-center py-8">
                                        <p className="font-semibold mb-2">Ask questions about the analysis</p>
                                        <p>Example: "What are the main risk factors for Lahore?"</p>
                                    </div>
                                )}
                                {chatMessages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] px-3 py-2 text-xs ${msg.role === 'user'
                                                ? 'bg-neutral-900 text-white border-2 border-neutral-900'
                                                : 'bg-white text-neutral-900 border-2 border-neutral-300'
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {chatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white text-neutral-900 border-2 border-neutral-300 px-3 py-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t-2 border-neutral-900 p-3">
                                <div className="flex gap-2">
                                    <Input
                                        value={chatInput}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatInput(e.target.value)}
                                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && sendChatMessage()}
                                        placeholder="Type your question..."
                                        className="flex-1 border-2 border-neutral-300 focus:border-neutral-900 text-xs"
                                        disabled={chatLoading}
                                    />
                                    <Button
                                        onClick={sendChatMessage}
                                        disabled={chatLoading || !chatInput.trim()}
                                        className="bg-neutral-900 hover:bg-neutral-800 text-white border-2 border-neutral-900"
                                        size="sm"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}