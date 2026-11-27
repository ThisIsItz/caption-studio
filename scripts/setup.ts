import {ensureWhisper} from '../server/whisper';

console.log('Instalando whisper.cpp y descargando el modelo (solo la primera vez, puede tardar unos minutos)…');
await ensureWhisper();
console.log('Listo. Ahora ejecuta: npm run dev');
