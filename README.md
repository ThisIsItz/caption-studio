# Caption Studio

Web app local para ponerle subtítulos tipo TikTok/Reels a tus vídeos. Todo corre en tu Mac y es gratis:

- **Whisper** (whisper.cpp) transcribe el audio palabra a palabra, en local.
- **Remotion** dibuja los subtítulos con React y renderiza el MP4 final.
- Ves el resultado **en directo** mientras cambias fuente, colores, tamaño y posición.

## Requisitos (una sola vez)

1. **Node 18 o superior**: `node -v`
2. **Herramientas de compilación de Xcode** (whisper.cpp se compila en tu Mac):
   ```bash
   xcode-select --install
   ```

## Instalación (una sola vez)

```bash
npm install
npm run setup
```

`npm run setup` compila whisper.cpp y descarga el modelo `medium` (~1,5 GB). Tarda unos minutos.

## Uso

```bash
npm run dev
```

Abre **http://localhost:5173** y:

1. Arrastra tu vídeo. Se sube y se transcribe automáticamente.
2. Pestaña **Estilo**: fuente, tamaño, colores, contorno, posición, cuántas palabras salen a la vez, resaltado de la palabra que se dice (color o caja), mayúsculas y animación.
   - **Guardar como mi estilo** lo deja como predeterminado para los siguientes vídeos.
3. Pestaña **Texto**: corrige las palabras mal entendidas. Haz clic en la hora para saltar a ese momento.
   - **Buscar y reemplazar** cambia todas las veces que sale una palabra (útil para nombres propios que Whisper siempre escribe mal).
4. **Exportar vídeo** → **Descargar MP4**. Los vídeos exportados también se guardan en `data/out/`.

La primera exportación tarda un poco más porque prepara el proyecto de Remotion. Las siguientes van más rápido.

## Ajustes opcionales

Variables de entorno al arrancar:

```bash
WHISPER_MODEL=small npm run dev      # más rápido, algo menos preciso
WHISPER_MODEL=large-v3 npm run dev   # más preciso, más lento (descarga ~3 GB la primera vez)
WHISPER_LANGUAGE=en npm run dev      # vídeos en inglés
```

Si cambias de modelo, se descarga solo la primera vez que transcribas.

## Personalizar

- **Fuentes**: `src/remotion/fonts.ts`. Añade cualquier fuente de Google Fonts importándola de `@remotion/google-fonts/<NombreFuente>`.
- **Aspecto de los subtítulos**: `src/remotion/Captions.tsx`. Es un componente de React normal.
- **Estilo por defecto**: `DEFAULT_STYLE` en `src/remotion/types.ts`.

## Estructura

```
src/remotion/   Composición de Remotion (la usan la vista previa y el render)
src/app/        Interfaz web (Vite + React + Remotion Player)
server/         Servidor Express: subida, transcripción y render
data/           Vídeos subidos y exportados (se crea solo)
```

## Si algo falla

- **Error al compilar whisper.cpp**: comprueba que tienes las herramientas de Xcode (`xcode-select --install`).
- **Avisos de versiones de Remotion distintas**: ejecuta `npx remotion upgrade` para alinearlas.
- **El vídeo sale girado o con un tamaño raro**: dímelo con el error o una captura; la detección de rotación está en `server/probe.ts`.

## Licencia de Remotion

Remotion es gratis para particulares y empresas de hasta 3 personas.
