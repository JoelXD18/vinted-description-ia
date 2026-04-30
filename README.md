# VintedDescribe ✦

Genera descripciones para tus artículos de Vinted con IA (Google Gemini). Gratis, optimizado para móvil.

## 🚀 Instalación local

```bash
# 1. Clona el repositorio
git clone https://github.com/TU_USUARIO/vinted-descripcion.git
cd vinted-descripcion

# 2. Instala dependencias
npm install

# 3. Crea el archivo de variables de entorno
cp .env.example .env.local
# Edita .env.local y pon tu API key de Gemini

# 4. Arranca el servidor de desarrollo
npm run dev
```

Abre http://localhost:3000 en tu navegador.

## 🔑 Obtener API key de Gemini (gratis)

1. Ve a https://aistudio.google.com
2. Haz click en "Get API key"
3. Crea una nueva API key
4. Cópiala en tu `.env.local`:
   ```
   GEMINI_API_KEY=AIza_tu_key_aqui
   ```

## 🌐 Desplegar en Vercel

1. Sube el proyecto a GitHub
2. Ve a https://vercel.com y conecta tu repositorio
3. En la configuración del proyecto, añade la variable de entorno:
   - Nombre: `GEMINI_API_KEY`
   - Valor: tu API key de Gemini
4. Despliega

## 💡 Límites gratuitos de Gemini

- 1.500 peticiones al día
- 15 peticiones por minuto
- Más que suficiente para uso personal

## 🛠️ Stack

- **Next.js 14** (App Router)
- **Google Gemini 1.5 Flash** (visión + texto)
- **Vercel** (hosting)
