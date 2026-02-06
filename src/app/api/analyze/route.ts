// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { structuredAgent } from "@/lib/agent";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const { regions, dateRange, threadId } = await req.json();

        if (!regions || regions.length === 0) {
            return NextResponse.json(
                { error: "At least one region required" },
                { status: 400 }
            );
        }

        const actualThreadId = threadId || crypto.randomUUID();
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                type: "status",
                                message: "INITIALIZING FOODGUARD AI ANALYSIS SYSTEM"
                            })}\n\n`
                        )
                    );

                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                type: "status",
                                message: `ANALYZING ${regions.length} REGION(S): ${regions.join(", ").toUpperCase()}`
                            })}\n\n`
                        )
                    );

                    const streamResult = await structuredAgent.stream(
                        {
                            messages: [{
                                role: "user",
                                content: `Analyze food security for regions: ${regions.join(", ")}. Date range: ${dateRange || "next 30 days"}`
                            }]
                        },
                        {
                            configurable: { thread_id: actualThreadId },
                            streamMode: "values"
                        }
                    );

                    let toolCallsInProgress = new Set<string>();
                    let toolDataCache: Record<string, any> = {};

                    // Tool name mapping for professional display
                    const toolDisplayNames: Record<string, string> = {
                        get_weather_data: "WEATHER DATA",
                        get_market_prices: "MARKET PRICES",
                        get_warehouse_stock: "WAREHOUSE INVENTORY",
                        get_production_forecast: "PRODUCTION FORECAST",
                        get_crop_health: "CROP HEALTH STATUS",
                        get_historical_shortage_data: "HISTORICAL DATA"
                    };

                    for await (const chunk of streamResult) {
                        const messages = chunk.messages || [];
                        const latestMessage = messages[messages.length - 1];

                        if (latestMessage) {
                            // Handle tool calls
                            if ((latestMessage as any).tool_calls && (latestMessage as any).tool_calls.length > 0) {
                                for (const toolCall of (latestMessage as any).tool_calls) {
                                    if (!toolCallsInProgress.has(toolCall.id)) {
                                        toolCallsInProgress.add(toolCall.id);
                                        const displayName = toolDisplayNames[toolCall.name] || toolCall.name.toUpperCase();
                                        
                                        controller.enqueue(
                                            encoder.encode(
                                                `data: ${JSON.stringify({
                                                    type: "tool_start",
                                                    tool: toolCall.name,
                                                    message: `[FETCHING] ${displayName}`
                                                })}\n\n`
                                            )
                                        );
                                    }
                                }
                            }

                            // Handle tool results
                            if (latestMessage._getType && latestMessage._getType() === "tool") {
                                const toolName = (latestMessage as any).name;
                                const toolContent = latestMessage.content;
                                const displayName = toolDisplayNames[toolName] || toolName.toUpperCase();

                                // Parse and cache tool data for static display
                                try {
                                    const parsedData = typeof toolContent === 'string' 
                                        ? JSON.parse(toolContent) 
                                        : toolContent;
                                    
                                    toolDataCache[toolName] = parsedData;

                                    // Send tool data to frontend for static panels
                                    controller.enqueue(
                                        encoder.encode(
                                            `data: ${JSON.stringify({
                                                type: "tool_data",
                                                toolName: toolName,
                                                data: parsedData
                                            })}\n\n`
                                        )
                                    );
                                } catch (e) {
                                    console.error(`Failed to parse ${toolName} data:`, e);
                                }

                                controller.enqueue(
                                    encoder.encode(
                                        `data: ${JSON.stringify({
                                            type: "tool_end",
                                            tool: toolName,
                                            message: `[COMPLETE] ${displayName}`
                                        })}\n\n`
                                    )
                                );
                            }

                            // Handle AI thinking
                            if (latestMessage.content && typeof latestMessage.content === 'string') {
                                controller.enqueue(
                                    encoder.encode(
                                        `data: ${JSON.stringify({
                                            type: "thinking",
                                            message: "[PROCESSING] ANALYZING DATA PATTERNS AND RISK FACTORS"
                                        })}\n\n`
                                    )
                                );
                            }
                        }

                        // Check for structured response
                        if (chunk.structuredResponse) {
                            controller.enqueue(
                                encoder.encode(
                                    `data: ${JSON.stringify({
                                        type: "status",
                                        message: "[FINALIZING] GENERATING COMPREHENSIVE REPORT"
                                    })}\n\n`
                                )
                            );

                            controller.enqueue(
                                encoder.encode(
                                    `data: ${JSON.stringify({
                                        type: "complete",
                                        report: chunk.structuredResponse,
                                        toolData: toolDataCache
                                    })}\n\n`
                                )
                            );
                            break;
                        }
                    }

                    controller.close();
                } catch (error) {
                    console.error("Stream error:", error);
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                type: "error",
                                error: error instanceof Error ? error.message : "Analysis failed"
                            })}\n\n`
                        )
                    );
                    controller.close();
                }
            }
        });

        return new NextResponse(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        });

    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const region = searchParams.get("region");

        if (!region) {
            return NextResponse.json({ error: "Region required" }, { status: 400 });
        }

        const result = await structuredAgent.invoke(
            {
                messages: [{
                    role: "user",
                    content: `Quick food security analysis for ${region}`
                }]
            },
            {
                configurable: { thread_id: crypto.randomUUID() }
            }
        );

        return NextResponse.json({
            report: result.structuredResponse,
            success: true
        });

    } catch (error) {
        console.error("GET error:", error);
        return NextResponse.json(
            {
                error: "Failed to analyze region",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}