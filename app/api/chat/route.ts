import { type NextRequest, NextResponse } from "next/server"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface EnhancePromptRequest {
  prompt: string
  context?: {
    fileName?: string
    language?: string
    codeContent?: string
  }
}

async function generateAIResponse(messages: ChatMessage[]) {
  const systemPrompt = `You are an expert AI coding assistant. You help developers with:
- Code explanations and debugging
- Best practices and architecture advice
- Writing clean, efficient code
- Troubleshooting errors
- Code reviews and optimizations

Always provide clear, practical answers. When showing code, use proper formatting with language-specific syntax.
Keep responses concise but comprehensive. Use code blocks with language specification when providing code examples.`

  const fullMessages = [{ role: "system", content: systemPrompt }, ...messages]

  const prompt = fullMessages.map((msg) => `${msg.role}: ${msg.content}`).join("\n\n")

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tinyllama",
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000,
          num_predict: 1000,
          repeat_penalty: 1.1,
          context_length: 4096,
        },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error from AI model API:", errorText)
      throw new Error(`AI model API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    if (!data.response) {
      throw new Error("No response from AI model")
    }
    return data.response.trim()
  } catch (error) {
    clearTimeout(timeoutId)
    if ((error as Error).name === "AbortError") {
      throw new Error("Request timeout: AI model took too long to respond")
    }
    console.error("AI generation error:", error)
    throw error
  }
}

async function enhancePrompt(request: EnhancePromptRequest) {
  const enhancementPrompt = `You are a prompt enhancement assistant. Take the user's basic prompt and enhance it to be more specific, detailed, and effective for a coding AI assistant.

Original prompt: "${request.prompt}"

Context: ${request.context ? JSON.stringify(request.context, null, 2) : "No additional context"}

Enhanced prompt should:
- Be more specific and detailed
- Include relevant technical context
- Ask for specific examples or explanations
- Be clear about expected output format
- Maintain the original intent

Return only the enhanced prompt, nothing else.`

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "codellama:latest",
        prompt: enhancementPrompt,
        stream: false,
        options: {
          temperature: 0.3,
          max_tokens: 500,
        },
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to enhance prompt")
    }

    const data = await response.json()
    return data.response?.trim() || request.prompt
  } catch (error) {
    console.error("Prompt enhancement error:", error)
    return request.prompt // Return original if enhancement fails
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, mode } = body;

    console.log("📩 Received request:", { message, mode, historyLength: history?.length });

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // 🔧 TRY-CATCH for Ollama call
    let aiResponse = "";
    
    try {
      console.log("🤖 Calling Ollama...");
      
      const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "tinyllama",
          prompt: `You are a helpful coding assistant.\n\nUser: ${message}\n\nAssistant:`,
          stream: false,
          options: {
            num_predict: 500,
            temperature: 0.7,
          },
        }),
      });

      if (!ollamaResponse.ok) {
        const errorText = await ollamaResponse.text();
        console.error("❌ Ollama error:", errorText);
        throw new Error(`Ollama returned ${ollamaResponse.status}`);
      }

      const data = await ollamaResponse.json();
      console.log("✅ Ollama response received");
      
      aiResponse = data.response?.trim() || "No response from AI";
      
    } catch (ollamaError) {
      console.error("❌ Ollama connection failed:", ollamaError);
      
      // 🎯 FALLBACK: Mock response for testing
      aiResponse = `I received your message: "${message}"\n\n**Note:** I'm currently unable to connect to the AI model (Ollama). Please ensure:\n1. Ollama is running (\`ollama serve\`)\n2. TinyLlama model is installed (\`ollama pull tinyllama\`)\n3. Port 11434 is accessible\n\nError: ${(ollamaError as Error).message}`;
    }

    return NextResponse.json({
      response: aiResponse,
      model: "TinyLlama",
      tokens: aiResponse.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("❌ Route error:", error);
    return NextResponse.json(
      {
        error: "Server error",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
export async function GET() {
  return NextResponse.json({
    status: "AI Chat API is running",
    timestamp: new Date().toISOString(),
    info: "Use POST method to send chat messages or enhance prompts",
  })
}