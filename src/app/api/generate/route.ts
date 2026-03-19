
import { NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ]
    });

    // Extracting data
    const { 
      theme, genre, language, structure, episodes, 
      durationType, durationValue, characters, hasPlot, plot 
    } = data;

    // Formatting Characters
    const charString = characters.map((c: any) => `- ${c.name} (${c.gender}) as ${c.role}`).join('\n');
    
    // Formatting Plot
    const plotString = hasPlot ? `
      Start: ${plot.start}
      Mid: ${plot.mid}
      Twist: ${plot.twist}
      Climax: ${plot.climax}
      End: ${plot.end}
    ` : "Create an engaging plot dynamically.";

    // Revised Mega Prompt with Native Tone and Roman Script
    const prompt = `Act as an award-winning screenwriter. Write a short, powerful screenplay based on these exact requirements:
    
    - Target Language/Script: ${language}.
    - Tone: Use a raw, local, and native language tone. Avoid overly bookish or professional professional vocabulary. Make it sound colloquial and direct.
    
    IF target language is "Roman Hindi/Urdu", the entire final output (screenplay structure, dialogue, etc.) MUST be written in the Roman script, using standard Hindi/Urdu vocabulary.
    - Structure: ${structure} ${structure === 'Series' ? `(${episodes} Episodes)` : ''}
    - Genre: ${genre}
    - Theme: ${theme}
    - Duration Target: ${durationValue} ${durationType}
    
    Characters:
    ${charString}
    
    Story Arc:
    ${plotString}

    CRITICAL SCREENPLAY FORMATTING RULES:
    1. DO NOT use markdown like ** or ##.
    2. DO NOT use any inline CSS styles, especially color functions like lab() or color().
    3. Format the output using clean, semantic HTML tags ONLY:
       Use <h2> for SCENE HEADINGS (e.g., INT. CAFE - DAY).
       Use <b> for CHARACTER NAMES before dialogue.
       Use <p> for ACTION LINES and DIALOGUE.
    4. Provide the full structured screenplay.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return NextResponse.json({ script: response.text() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}