export async function POST(request) {
  try {
    const { imagen, talla, estado, estilo, precio } = await request.json();
 
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "API key no configurada" }, { status: 500 });
    }
 
    const estiloPrompts = {
      cercano: "Tono cercano, simpático y natural. Como si lo escribiera una persona joven.",
      directo: "Tono directo, conciso y sin adornos. Solo los datos importantes.",
      emojis: "Tono desenfadado con emojis relevantes para hacer el anuncio más visual y atractivo.",
    };
 
    const prompt = `Eres un experto vendedor de ropa de segunda mano en Vinted España.
Analiza la imagen de esta prenda y genera una descripción para publicar en Vinted.
 
Datos adicionales que el vendedor ha indicado:
- Talla: ${talla || "no especificada"}
- Estado: ${estado || "no especificado"}
- Precio: ${precio ? precio + "€" : "no especificado"}
 
Genera una descripción que incluya:
1. Tipo de prenda y marca si es visible en la imagen
2. Color y detalles destacables que se vean
3. Estado de la prenda
4. Un argumento de venta atractivo
 
${estiloPrompts[estilo] || estiloPrompts.cercano}
 
Longitud: 3-5 frases. En español. No uses asteriscos ni markdown. Solo texto plano.
No inventes información que no puedas ver en la imagen.
 
Al final de la descripción añade entre 5 y 8 hashtags relevantes separados por espacios.
Los hashtags deben incluir: la marca si es visible, tipo de prenda, color, talla si se proporcionó, y términos de búsqueda populares en Vinted España.`;
 
    const body = {
      model: "meta-llama/llama-4-maverick:free",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imagen },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
      max_tokens: 400,
      temperature: 0.7,
    };
 
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://vinted-descripcion.vercel.app",
        "X-Title": "VintedDescribe",
      },
      body: JSON.stringify(body),
    });
 
    const data = await res.json();
 
    if (!res.ok) {
      return Response.json({ error: data.error?.message || "Error de OpenRouter" }, { status: 500 });
    }
 
    const descripcion = data.choices?.[0]?.message?.content;
    if (!descripcion) {
      return Response.json({ error: "No se pudo generar la descripción" }, { status: 500 });
    }
 
    return Response.json({ descripcion });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
