export const dynamic = 'force-dynamic'

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
 
    const prompt = `Eres un vendedor experto en moda y streetwear en Vinted España. Tu objetivo es escribir descripciones que vendan, como lo haría una persona real con buen ojo para la moda.
 
Mira la imagen y escribe DIRECTAMENTE la descripción final. No escribas pasos, no escribas títulos, no uses negritas, no uses guiones de lista. Solo el texto de la descripción seguido de los hashtags.
 
Analiza internamente (sin escribirlo):
- La marca si aparece en logos, bordados o etiquetas visibles. Si pone un nombre, es esa marca.
- El tipo de prenda y su estilo (streetwear, vintage, Y2K, deportivo, etc.)
- El color de forma natural ("amarillo mostaza", "verde botella", no códigos hex)
- Detalles que llamen la atención a un comprador
 
Luego escribe una descripción de 4-5 frases en español que:
- Empiece con la marca y tipo de prenda si la identificas
- Si es una marca conocida en streetwear/moda, menciona brevemente por qué mola o es buscada
- Describa el color y detalles de forma natural, como hablaría una persona
- Indique talla (${talla || "no especificada"}), estado (${estado || "no especificado"}) y precio (${precio ? precio + "€" : "no especificado"}) si están disponibles
- Termine con un argumento de venta genuino
 
${estiloPrompts[estilo] || estiloPrompts.cercano}
 
Sin asteriscos, sin guiones de lista, sin títulos, sin markdown. Solo texto corrido natural.
 
Después de la descripción, en una nueva línea, añade 10-15 hashtags separados por espacios.
IMPORTANTE: Cada hashtag va todo junto sin espacios internos.
✅ #RopaSegundaMano #HoodieAmarillo #Streetwear
❌ #ropa segunda mano #hoodie amarillo
 
Hashtags deben cubrir: marca, tipo de prenda, estilo, color, talla, y términos populares en Vinted España.`;
 
    const body = {
      model: "google/veo-3.1-fast",
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
      max_tokens: 800,
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
