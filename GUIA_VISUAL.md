# 👁️ GUÍA VISUAL - Qué Esperar en Cada Paso

Esta guía te muestra exactamente qué vas a ver en cada etapa del proceso.

---

## 🔥 En Firebase Console

### 1. Crear Proyecto
**Qué verás:**
```
┌──────────────────────────────────────┐
│  Agregar proyecto                    │
├──────────────────────────────────────┤
│  Paso 1 de 3                         │
│  ¿Cómo quieres llamar a tu proyecto? │
│  ┌────────────────────────────────┐  │
│  │ champions-predictions          │  │
│  └────────────────────────────────┘  │
│                    [Continuar]       │
└──────────────────────────────────────┘
```

### 2. Configuración del Proyecto (⚙️)
**Qué verás:**
```
┌──────────────────────────────────────────────┐
│  Tus apps                                    │
├──────────────────────────────────────────────┤
│  No hay apps en tu proyecto                  │
│  [</> Web]  [📱 iOS]  [🤖 Android]          │
│     ↑                                        │
│  Haz clic aquí                              │
└──────────────────────────────────────────────┘
```

### 3. Configuración de la App
**Qué verás:**
```
Apodo de la aplicación: Champions Web
☐ También configurar Firebase Hosting ← NO marcar

Configuración del SDK de Firebase:

const firebaseConfig = {
  apiKey: "AIzaSyBx...",           ← Copiar
  authDomain: "champions-xxx...",  ← Copiar
  databaseURL: "https://...",      ← Copiar
  projectId: "champions-xxx",      ← Copiar
  ...
};
```

### 4. Realtime Database
**Qué verás al crear:**
```
┌──────────────────────────────────────────────┐
│  Realtime Database                           │
├──────────────────────────────────────────────┤
│  Crear base de datos                         │
│                                              │
│  Ubicación:                                  │
│  ○ Estados Unidos (us-central1)             │
│  ○ Europa (europe-west1)                     │
│                                              │
│  Reglas de seguridad:                        │
│  ⦿ Comenzar en modo de prueba   ← Seleccionar│
│  ○ Comenzar en modo bloqueado               │
│                                [Habilitar]   │
└──────────────────────────────────────────────┘
```

**Después de crear:**
```
┌──────────────────────────────────────────────┐
│  https://champions-xxx.firebaseio.com        │
├──────────────────────────────────────────────┤
│  [Datos]  [Reglas]  [Copias de seguridad]   │
│                                              │
│  championsData                               │
│    ├─ groups: {}                            │
│    ├─ matches: []                           │
│    └─ predictions: {}                       │
│                                              │
│  (Aparecerán datos aquí cuando uses la app) │
└──────────────────────────────────────────────┘
```

### 5. Reglas de Seguridad
**Qué verás:**
```
┌──────────────────────────────────────────────┐
│  [Datos]  [Reglas]  [Copias de seguridad]   │
├──────────────────────────────────────────────┤
│  {                                           │
│    "rules": {                                │
│      ".read": true,   ← Debe estar en true   │
│      ".write": true   ← Debe estar en true   │
│    }                                         │
│  }                                           │
│                              [Publicar]      │
└──────────────────────────────────────────────┘
```

---

## 💻 En tu Terminal

### Instalación
**Qué verás:**
```bash
$ npm install
npm WARN deprecated...
...
added 234 packages in 15s
```

### Desarrollo Local
**Qué verás:**
```bash
$ npm run dev

  VITE v5.0.8  ready in 342 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Build
**Qué verás:**
```bash
$ npm run build

vite v5.0.8 building for production...
✓ 1234 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-abc123.css     12.34 kB │ gzip:  3.45 kB
dist/assets/index-xyz789.js     156.78 kB │ gzip: 51.23 kB
✓ built in 2.34s
```

### Firebase Login
**Qué verás:**
```bash
$ firebase login

✔  Success! Logged in as tu-email@gmail.com
```

### Firebase Init
**Qué verás:**
```bash
$ firebase init

? Which Firebase features do you want to set up?
❯◉ Hosting: Configure files for Firebase Hosting

? Select a default Firebase project:
❯ champions-predictions-xxx (champions-predictions)

? What do you want to use as your public directory?
→ dist

? Configure as a single-page app?
→ Yes

? Set up automatic builds and deploys with GitHub?
→ No
```

### Firebase Deploy
**Qué verás:**
```bash
$ firebase deploy

=== Deploying to 'champions-predictions-xxx'...

i  deploying hosting
i  hosting[champions-predictions-xxx]: beginning deploy...
✔  hosting[champions-predictions-xxx]: file upload complete
i  hosting[champions-predictions-xxx]: finalizing version...
✔  hosting[champions-predictions-xxx]: version finalized
i  hosting[champions-predictions-xxx]: releasing new version...
✔  hosting[champions-predictions-xxx]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/champions-xxx
Hosting URL: https://champions-predictions-xxx.web.app
                ↑
         Comparte esta URL con tus amigos
```

---

## 🌐 En el Navegador

### Pantalla de Login (Primera vez)
**Qué verás:**
```
┌─────────────────────────────────────────┐
│                                         │
│           🏆                            │
│      Champions League                   │
│   Sistema de Predicciones              │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Selecciona tu Usuario             │ │
│  │                                   │ │
│  │ -- Seleccionar Jugador --        │ │
│  │ ▼                                │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │         ENTRAR                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [ 🔒 Acceso Administrador ]           │
│                                         │
└─────────────────────────────────────────┘
```

### Vista de Jugador
**Qué verás:**
```
┌────────────────────────────────────────────────┐
│  🏆 Champions League  [Cerrar Sesión]          │
│  Bienvenido, German Meek                       │
│                                                │
│  [Predicciones] [Clasificación] [Votaciones]  │
├────────────────────────────────────────────────┤
│  Hacer Predicciones                            │
│                                                │
│  📋 Grupo A                                    │
│  ┌──────────────────────────────────────────┐ │
│  │ Grupo A                                  │ │
│  │ Tottenham vs Juventus                    │ │
│  │                                          │ │
│  │ ¿Quién ganará?                           │ │
│  │ [-- Seleccionar --     ▼]               │ │
│  │                                          │ │
│  │ Goles Tottenham: [  ]  Goles Juventus: [  ]│ │
│  │                                          │ │
│  │ Primer Goleador: [-- Seleccionar --  ▼] │ │
│  │                                          │ │
│  │ [      ENVIAR PREDICCIÓN      ]         │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

### Vista de Admin
**Qué verás:**
```
┌────────────────────────────────────────────────┐
│  🏆 Champions League  [Cerrar Sesión]          │
│  Panel de Administrador                        │
│                     [⚠️ Restablecer Sistema]   │
├────────────────────────────────────────────────┤
│  Crear Grupos                                  │
│  ┌──────────────────────────────────────────┐ │
│  │ Nombre del grupo: [ A          ]        │ │
│  │                                          │ │
│  │ Selecciona equipos:                      │ │
│  │ [Tottenham] [Juventus] [Inter de Milán] │ │
│  │ [Man City]  [PSG]      [...más]         │ │
│  │                                          │ │
│  │ [      CREAR GRUPO      ]               │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  Grupos Existentes                             │
│  ┌──────────────────────────────────────────┐ │
│  │ Grupo A                          [🗑️]   │ │
│  │ Tottenham, Juventus, Inter, Man City    │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

### Clasificación
**Qué verás:**
```
┌────────────────────────────────────────────────┐
│  Clasificación                                 │
│                                                │
│  [Predicciones] [Llegadas]                     │
├────────────────────────────────────────────────┤
│  Pos.  Jugador              Puntos             │
│  🥇    German Meek           45                │
│  🥈    Julian Rojas          38                │
│  🥉    Daniel Alzate         35                │
│  4°    JuanPa Villegas       32                │
│  5°    Sebastian Martin      28                │
│  ...                                           │
└────────────────────────────────────────────────┘
```

### Votaciones (Usuario)
**Qué verás cuando NO hay votación activa:**
```
┌────────────────────────────────────────────────┐
│  Votaciones                                    │
├────────────────────────────────────────────────┤
│           🗳️                                   │
│   No hay votaciones activas                    │
│   El administrador abrirá las votaciones       │
│   próximamente                                 │
└────────────────────────────────────────────────┘
```

**Qué verás cuando HAY votación activa:**
```
┌────────────────────────────────────────────────┐
│  Votaciones                                    │
├────────────────────────────────────────────────┤
│  ⚽ Mejor Gol                                   │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ Gol de German Meek vs PSG            ✓  │ │
│  └──────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────┐ │
│  │ Gol de Julian Rojas vs Bayern           │ │
│  └──────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────┐ │
│  │ Gol de Daniel Alzate vs Real Madrid     │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 📱 En el Celular

### Vista Móvil Adaptada
**Qué verás:**
```
┌──────────────────┐
│🏆 Champions League│
│Bienvenido, German│
│                  │
│ [Predicciones]   │
│ [Clasificación]  │
│ [Votaciones]     │
├──────────────────┤
│ Predicciones     │
│                  │
│ Grupo A          │
│ Tottenham vs     │
│ Juventus         │
│                  │
│ Ganador:         │
│ [Seleccionar ▼]  │
│                  │
│ Goles:           │
│ [0]    [0]       │
│                  │
│ 1er Gol:         │
│ [Seleccionar ▼]  │
│                  │
│ [ENVIAR]         │
│                  │
└──────────────────┘
```

---

## 🔄 Sincronización en Tiempo Real

**Escenario: Admin registra un resultado**

**Navegador 1 (Admin):**
```
[Registra resultado: Real Madrid 2 - Barcelona 1]
[Presiona Guardar]
✅ Resultado registrado
```

**Navegador 2 (German - Auto-actualiza):**
```
🔔 Nuevo resultado
Real Madrid 2 - 1 Barcelona
+5 puntos (marcador exacto)
Clasificación actualizada
```

**Celular (Julian - Auto-actualiza):**
```
🔔 Partido finalizado
Real Madrid ganó 2-1
Has ganado 3 puntos
```

---

## ✅ Señales de que Todo Funciona

### En Firebase Console:
- ✅ Ves tu proyecto creado
- ✅ Realtime Database muestra datos cuando usas la app
- ✅ Las reglas dicen `.read: true` y `.write: true`

### En Terminal:
- ✅ `npm install` completa sin errores
- ✅ `npm run dev` abre la app en localhost
- ✅ `firebase deploy` muestra "Deploy complete!"

### En el Navegador:
- ✅ La app carga sin errores
- ✅ Puedes seleccionar usuario
- ✅ Como admin puedes crear grupos
- ✅ Los cambios se guardan y persisten

### En Múltiples Dispositivos:
- ✅ Abres en desktop y celular → ves lo mismo
- ✅ Haces cambio en uno → se refleja en el otro
- ✅ Un amigo abre → ve tus datos

---

## 🚨 Señales de Problemas

### ❌ Error "Firebase not configured":
```
🔴 Error en consola (F12):
Firebase: Firebase App named '[DEFAULT]' already exists
o
Firebase: apiKey is not defined
```
→ Revisa `src/firebase.js`

### ❌ Error "Permission denied":
```
🔴 Error en consola (F12):
FIREBASE WARNING: set at /championsData failed: 
permission_denied
```
→ Revisa reglas en Realtime Database

### ❌ Cambios no se sincronizan:
```
🔴 Haces cambio en desktop
🔴 No aparece en celular
```
→ Abre consola (F12) en ambos
→ Busca errores de Firebase
→ Verifica que ambos estén usando la misma URL

---

Con esta guía visual, deberías saber exactamente qué esperar en cada paso. ¡Suerte! 🎉
