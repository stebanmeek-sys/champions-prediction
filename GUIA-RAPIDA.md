# 🚀 Guía Rápida - 5 Minutos

## Paso 1: Configurar Firebase (2 minutos)

1. Ve a https://console.firebase.google.com/
2. Crear proyecto → nombre: "champions-predictions"
3. Menú lateral → "Realtime Database" → "Crear base de datos"
4. Ubicación: **Estados Unidos (us-central1)**
5. Modo: **Prueba**
6. En "Reglas", pegar:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```

## Paso 2: Obtener Credenciales (1 minuto)

1. Configuración ⚙️ → "Configuración del proyecto"
2. "Tus apps" → `</>` (Web)
3. Nombre: "Champions Predictions"
4. **Copiar** las credenciales que aparecen

## Paso 3: Actualizar Código (30 segundos)

Abre `src/firebase.js` y pega tus credenciales:

```javascript
const firebaseConfig = {
  apiKey: "PEGAR_AQUI",
  authDomain: "PEGAR_AQUI",
  databaseURL: "PEGAR_AQUI",  // ← ¡Importante!
  projectId: "PEGAR_AQUI",
  storageBucket: "PEGAR_AQUI",
  messagingSenderId: "PEGAR_AQUI",
  appId: "PEGAR_AQUI"
};
```

## Paso 4: Instalar y Ejecutar (1 minuto)

```bash
npm install
npm run dev
```

Abre: http://localhost:5173

## Paso 5: Subir a GitHub y Vercel (1 minuto)

```bash
# GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/champions-predictions.git
git push -u origin main

# Vercel
# Ve a vercel.com → "Add New" → "Project" → Selecciona tu repo → Deploy
```

## ✅ ¡Listo!

Comparte tu link de Vercel con tus amigos:
`https://tu-proyecto.vercel.app`

---

### 🔧 Comando Útiles

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Deploy a Vercel
vercel --prod
```

### 🎮 Credenciales Admin

- **Contraseña**: `champions2024`
- Para cambiarla: busca en `ChampionsLeagueApp.jsx` la línea con `'champions2024'`

### 🔥 Firebase Console

- **Ver datos**: Firebase Console → Realtime Database → Pestaña "Datos"
- **Ver reglas**: Firebase Console → Realtime Database → Pestaña "Reglas"
- **URL de tu DB**: `https://TU-PROYECTO-default-rtdb.firebaseio.com`

### ⚡ Testing Rápido

1. Abre la app en 2 pestañas diferentes
2. En una pestaña selecciona un usuario y haz una predicción
3. En la otra pestaña deberías ver el cambio **inmediatamente**
4. ✅ Si ves el cambio = Firebase funciona correctamente

---

¿Problemas? Revisa `README.md` para solución de problemas detallada.
