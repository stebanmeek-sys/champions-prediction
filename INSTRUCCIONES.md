# 🚀 GUÍA RÁPIDA DE INICIO

## Paso 1: Descargar el proyecto
✅ Ya lo tienes! Descarga la carpeta `champions-predictions`

## Paso 2: Instalar dependencias
Abre una terminal en la carpeta del proyecto y ejecuta:
```bash
npm install
```

## Paso 3: Configurar Firebase (MUY IMPORTANTE)

### 3.1 Crear proyecto en Firebase
1. Ve a https://console.firebase.google.com/
2. Clic en "Agregar proyecto"
3. Dale un nombre (ej: "champions-predictions")
4. Desactiva Google Analytics (opcional)
5. Clic en "Crear proyecto"

### 3.2 Obtener configuración
1. En tu proyecto, clic en el ícono de engranaje ⚙️ > "Configuración del proyecto"
2. En la sección "Tus apps", haz clic en el ícono web `</>`
3. Dale un nombre a tu app (ej: "Champions Web")
4. **NO marques** "También configurar Firebase Hosting"
5. Clic en "Registrar app"
6. Copia el código de configuración que te muestra

### 3.3 Pegar configuración
1. Abre el archivo `src/firebase.js`
2. Reemplaza las líneas que dicen `"TU_API_KEY"`, `"TU_PROJECT_ID"`, etc. con los valores reales que copiaste
3. Debería verse así:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",  // Tu API key real
  authDomain: "tu-proyecto.firebaseapp.com",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 3.4 Crear Realtime Database
1. En Firebase Console, ve al menú lateral
2. Clic en "Realtime Database"
3. Clic en "Crear base de datos"
4. Elige una ubicación (ej: Estados Unidos)
5. Selecciona "Comenzar en **modo de prueba**"
6. Clic en "Habilitar"
7. Copia la URL que aparece arriba (ej: `https://tu-proyecto-default-rtdb.firebaseio.com`)
8. Verifica que esta URL esté en tu `src/firebase.js` en el campo `databaseURL`

### 3.5 Configurar reglas (Importante para que funcione)
1. En Realtime Database, ve a la pestaña "Reglas"
2. Reemplaza el contenido con:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
3. Clic en "Publicar"

⚠️ **NOTA**: Estas reglas permiten acceso completo. Para producción deberías hacerlas más restrictivas.

## Paso 4: Probar localmente
```bash
npm run dev
```
Abre http://localhost:5173 en tu navegador

## Paso 5: Desplegar en Firebase Hosting

### 5.1 Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 5.2 Login
```bash
firebase login
```

### 5.3 Inicializar
```bash
firebase init
```
- Selecciona: **Hosting**
- Usa un proyecto existente: Selecciona el que creaste
- Public directory: escribe `dist` y Enter
- Single-page app: escribe `y` y Enter
- Automatic builds: escribe `n` y Enter
- Overwrite index.html: escribe `n` y Enter

### 5.4 Build y Deploy
```bash
npm run build
firebase deploy
```

¡Listo! Firebase te dará una URL como: `https://tu-proyecto.web.app`

## Paso 6: Compartir con tus amigos
Copia la URL y envíala por WhatsApp, Telegram, etc.

---

## 🎮 Cómo usar la app

### Contraseña de Admin
Por defecto: `admin123`

### Funciones principales:
1. **Admin**: Crea grupos, partidos, habilita predicciones, registra resultados
2. **Jugadores**: Hacen predicciones y votan
3. **Todos**: Ven la clasificación en tiempo real

---

## ❓ Problemas comunes

### "Firebase not configured"
→ Revisa que hayas copiado bien las credenciales en `src/firebase.js`

### "Permission denied"
→ Verifica las reglas en Realtime Database (paso 3.5)

### No se ven los cambios
→ Haz `npm run build` y `firebase deploy` de nuevo

### La app no carga en móviles
→ Asegúrate de que la URL sea HTTPS (Firebase Hosting ya lo hace)

---

## 📝 Personalizar

### Cambiar equipos
Edita el array `teams` en `src/ChampionsPredictions.jsx` (líneas 6-23)

### Cambiar contraseña admin
Edita la línea ~237 en `src/ChampionsPredictions.jsx`:
```javascript
if (adminPassword === 'TU_NUEVA_CONTRASEÑA') {
```

---

¡Disfruta tu app de predicciones! ⚽🏆
