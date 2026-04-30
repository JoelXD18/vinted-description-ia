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
 
    const prompt = `Eres un experto en moda y streetwear con amplio conocimiento de marcas de ropa. Vendes en Vinted España y sabes exactamente qué descripción convierte visitas en ventas.
 
Analiza con detalle la imagen de esta prenda:
 
PASO 1 - IDENTIFICA:
- Marca (busca logos, etiquetas, parches, bordados, estampados con nombre). Si la reconoces aunque no sea 100% legible, indícala.
- Tipo de prenda exacto (hoodie, sudadera crewneck, camiseta oversized, cortavientos, etc.)
- Estilo (streetwear, vintage, Y2K, deportivo, casual, luxury, workwear, etc.)
- Color(es) exactos
- Detalles especiales (bordados, estampados, parches, lavado especial, corte, etc.)
 
PASO 2 - CONTEXTO DE MARCA:
Si identificas la marca, menciona brevemente por qué es interesante o buscada (ej: "marca muy buscada en el mercado de segunda mano", "collab limitada", "pieza vintage de los 90", "marca streetwear del momento", etc.)
 
PASO 3 - GENERA LA DESCRIPCIÓN:
Datos del vendedor:
- Talla: ${talla || "no especificada"}
- Estado: ${estado || "no especificado"}
- Precio: ${precio ? precio + "€" : "no especificado"}
 
${estiloPrompts[estilo] || estiloPrompts.cercano}
 
Longitud: 4-6 frases con gancho. En español. Sin asteriscos ni markdown. Solo texto plano.
Si no puedes identificar la marca con seguridad, descríbela por su estilo visual sin inventar.
 
PASO 4 - HASHTAGS:
Añade 10-15 hashtags al final separados por espacios.
REGLA CRÍTICA: Los hashtags NO pueden tener espacios internos. Usa CamelCase o todo junto.
✅ Correcto: #RopaSegundaMano #HoodieVintage #Streetwear #MarcaX
❌ Incorrecto: #ropa segunda mano #hoodie vintage
 
Incluye hashtags de: marca, tipo de prenda, estilo, color, talla, términos populares en Vinted España (como #Vinted #SegundaMano #Moda #Vintage #Streetwear #Ropa).`;
 
    const body = {
      model: "openrouter/free",
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
      max_tokens: 600,
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
