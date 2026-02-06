// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
    try {
        const { message, chatHistory, reportContext } = await req.json();

        if (!message || !message.trim()) {
            return NextResponse.json(
                { error: "Message is required", success: false },
                { status: 400 }
            );
        }

        // Use the same model as the agent for consistency
        const chatModel = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            apiKey: process.env.GOOGLE_API_KEY,
            temperature: 0.3,
            maxOutputTokens: 2048,
        });

        // Build context-aware system prompt
        const systemPrompt = buildSystemPrompt(reportContext);

        // Convert chat history and current message to LangChain messages
        const messages: BaseMessage[] = [
            new SystemMessage(systemPrompt),
            ...(chatHistory || []).map((msg: { role: string; content: string }) =>
                msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
            ),
            new HumanMessage(message)
        ];

        // Get response from model
        const response = await chatModel.invoke(messages);

        return NextResponse.json({
            response: response.content,
            success: true
        });

    } catch (error: any) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            {
                error: "Failed to generate response",
                message: error.message || "Unknown error",
                success: false
            },
            { status: 500 }
        );
    }
}

function buildSystemPrompt(reportContext: any): string {
    const hasReport = reportContext && reportContext.regions;

    let prompt = `You are an expert food security analyst assistant for the FoodGuard AI system.

ROLE AND RESPONSIBILITIES:
- Provide professional, data-driven insights about food security analysis
- Explain risk levels, shortage predictions, and agricultural conditions
- Answer questions about specific regions, crops, and data sources
- Suggest actionable recommendations based on available data
- Maintain a formal, professional tone suitable for government/institutional use

COMMUNICATION STYLE:
- Be concise and precise
- Use professional terminology but explain technical concepts clearly
- Reference specific data points when available
- Acknowledge limitations when data is incomplete
- Format responses in clear paragraphs, avoid excessive bullet points unless specifically requested

`;

    if (hasReport) {
        prompt += `\nCURRENT ANALYSIS CONTEXT:\n`;
        prompt += `Report ID: ${reportContext.reportId || 'N/A'}\n`;
        prompt += `Generated: ${reportContext.generatedAt || 'N/A'}\n`;
        prompt += `Overall Risk Level: ${reportContext.overallRiskLevel || 'N/A'}\n`;
        prompt += `Summary: ${reportContext.summary || 'No summary available'}\n\n`;

        if (reportContext.regions && reportContext.regions.length > 0) {
            prompt += `REGIONAL ANALYSIS DATA:\n`;
            reportContext.regions.forEach((region: any, idx: number) => {
                prompt += `\n${idx + 1}. ${region.name}:
   - Risk Level: ${region.riskLevel}
   - Confidence Score: ${region.confidenceScore}%
   - Predicted Shortage: ${region.shortageAmount} metric tons
   - Affected Crops: ${region.affectedCrops?.join(', ') || 'Not specified'}
   - Key Factors: ${region.keyFactors?.join(', ') || 'Not specified'}
   - Recommended Action: ${region.recommendedAction}
`;
            });
        }

        if (reportContext.criticalActions && reportContext.criticalActions.length > 0) {
            prompt += `\nCRITICAL ACTIONS REQUIRED:\n`;
            reportContext.criticalActions.forEach((action: any, idx: number) => {
                prompt += `${idx + 1}. ${action.action} (Urgency: ${action.urgency})\n`;
            });
        }

        prompt += `\nINSTRUCTIONS:
- Use this data to answer questions accurately
- Reference specific regions and metrics when relevant
- If asked about a region not in the analysis, acknowledge it's not in the current report
- Explain risk factors in terms of their real-world agricultural impact
- Prioritize human food security and safety in all recommendations\n`;
    } else {
        prompt += `\nCURRENT STATUS:
No analysis has been run yet. The user has not initiated a food security analysis.

INSTRUCTIONS:
- Inform the user they need to select regions and run an analysis first
- Explain what the analysis will provide
- Answer general questions about food security, agricultural risks, or the FoodGuard AI system
- Suggest they click "Initiate Analysis" to get specific insights for their selected regions\n`;
    }

    return prompt;
}

// Optional: Streaming version for real-time responses
export async function POST_STREAMING(req: NextRequest) {
    try {
        const { message, chatHistory, reportContext } = await req.json();

        if (!message || !message.trim()) {
            return NextResponse.json(
                { error: "Message is required", success: false },
                { status: 400 }
            );
        }

        const chatModel = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            apiKey: process.env.GOOGLE_API_KEY,
            temperature: 0.3,
            streaming: true,
        });

        const systemPrompt = buildSystemPrompt(reportContext);

        const messages: BaseMessage[] = [
            new SystemMessage(systemPrompt),
            ...(chatHistory || []).map((msg: { role: string; content: string }) =>
                msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
            ),
            new HumanMessage(message)
        ];

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const responseStream = await chatModel.stream(messages);

                    for await (const chunk of responseStream) {
                        const text = chunk.content;
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`)
                        );
                    }

                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
                    );
                    controller.close();
                } catch (error) {
                    console.error("Streaming error:", error);
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                error: "Stream failed",
                                success: false
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
            },
        });

    } catch (error: any) {
        console.error("Chat streaming API error:", error);
        return NextResponse.json(
            {
                error: "Failed to generate response",
                message: error.message || "Unknown error",
                success: false
            },
            { status: 500 }
        );
    }
}
