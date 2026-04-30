export async function POST(request) {
  try {
    const { imagen, talla, estado, estilo, precio } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
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
No inventes información que no puedas ver en la imagen.`;

    const body = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imagen.split(",")[1],
              },
            },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
      },
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.error?.message || "Error de Gemini" }, { status: 500 });
    }

    const descripcion = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!descripcion) {
      return Response.json({ error: "No se pudo generar la descripción" }, { status: 500 });
    }

    return Response.json({ descripcion });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
