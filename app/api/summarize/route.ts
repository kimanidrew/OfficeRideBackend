import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { fileData, mimeType } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) throw new Error("API Key missing");

    const model = "gemini-2.0-flash"; 
    const baseUrl = "https://generativelanguage.googleapis.com";
    const path = `/v1/models/${model}:generateContent`;
    
    const url = new URL(path, baseUrl);
    url.searchParams.append("key", apiKey);

    const cleanBase64 = fileData.includes(",") ? fileData.split(",")[1] : fileData;

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Extract all text from this document. Provide a professional summary including: 1. Document Type 2. Key Entities/Names 3. Important Dates 4. Brief Summary." },
            {
              inline_data: {
                mime_type: mimeType,
                data: cleanBase64
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1 
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini Error:", data);
      return NextResponse.json({ error: data.error?.message || "API error" }, { status: response.status });
    }

    let summary = data.candidates?.[0]?.content?.parts?.[0]?.text || "No analysis available.";

    // 🔧 Remove Markdown asterisks (bold/italic markers)
    summary = summary.replace(/\*/g, "");

    return NextResponse.json({ summary });

  } catch (error: any) {
    console.error("Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
