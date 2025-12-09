# 📁 Estructura del Proyecto

```
champions-predictions/
│
├── 📄 package.json          → Lista de dependencias (React, Firebase, etc)
├── 📄 vite.config.js        → Configuración de Vite (herramienta de build)
├── 📄 index.html            → Página HTML principal
├── 📄 firebase.json         → Configuración de Firebase Hosting
├── 📄 .gitignore            → Archivos que Git debe ignorar
├── 📄 README.md             → Documentación completa del proyecto
│
└── 📂 src/                  → Código fuente de la aplicación
    ├── 📄 main.jsx          → Punto de entrada de React
    ├── 📄 index.css         → Estilos globales
    ├── 📄 firebase.js       → ⚠️ CONFIGURAR AQUÍ tus credenciales
    └── 📄 ChampionsPredictions.jsx  → Componente principal con toda la lógica
```

---

## 📄 Descripción de Archivos Clave

### `package.json`
**¿Qué hace?**
- Lista todas las librerías que usa el proyecto
- Define comandos como `npm run dev` y `npm run build`

**No necesitas modificar** este archivo.

---

### `src/firebase.js` ⚠️ **IMPORTANTE - DEBES MODIFICAR**
**¿Qué hace?**
- Conecta tu aplicación con Firebase
- Contiene las credenciales de tu proyecto

**DEBES modificar:**
```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",              // ← Cambiar
  authDomain: "TU_PROJECT_ID...",    // ← Cambiar
  databaseURL: "https://TU_...",     // ← Cambiar
  projectId: "TU_PROJECT_ID",        // ← Cambiar
  // ... etc
};
```

**Cómo obtener los valores:**
1. Ve a Firebase Console
2. Configuración del proyecto (⚙️)
3. En "Tus apps", selecciona tu web app
4. Copia y pega los valores reales

---

### `src/ChampionsPredictions.jsx`
**¿Qué hace?**
- Contiene TODA la lógica de la aplicación
- Interfaz de usuario (UI)
- Gestión de predicciones, partidos, votaciones, etc.

**Puedes modificar:**

#### 1. Equipos y Jugadores (líneas 6-23)
```javascript
const teams = [
  { team: 'Real Madrid', player: 'Tu Nombre' },
  { team: 'Barcelona', player: 'Nombre Amigo' },
  // ... agrega o modifica equipos
];
```

#### 2. Contraseña de Admin (línea ~237)
```javascript
if (adminPassword === 'admin123') { // ← Cambia 'admin123'
```

#### 3. Sistema de Puntos (línea ~382)
```javascript
if (prediction.winner === resultWinner) {
  points += 3; // ← Puntos por acertar ganador
}
if (prediction.score1 === parseInt(resultScore1) && ...) {
  points += 5; // ← Puntos por marcador exacto
}
if (prediction.firstScorer === resultFirstScorer) {
  points += 2; // ← Puntos por primer goleador
}
```

---

### `src/main.jsx`
**¿Qué hace?**
- Punto de entrada de React
- Monta el componente principal en el DOM

**No necesitas modificar** este archivo.

---

### `src/index.css`
**¿Qué hace?**
- Estilos CSS globales básicos

**Puedes modificar** si quieres cambiar fuentes o estilos generales.

---

### `index.html`
**¿Qué hace?**
- HTML base de la aplicación
- React se "inyecta" en el `<div id="root">`

**No necesitas modificar** este archivo.

---

### `firebase.json`
**¿Qué hace?**
- Configuración para Firebase Hosting
- Le dice a Firebase que use la carpeta `dist`
- Configura la app como single-page application

**No necesitas modificar** este archivo.

---

### `.gitignore`
**¿Qué hace?**
- Lista archivos que Git debe ignorar
- Evita subir `node_modules` y otros archivos innecesarios

**No necesitas modificar** este archivo.

---

## 🔧 Flujo de Trabajo

### Desarrollo Local
```
1. Editas código en src/
2. Guardas los archivos
3. Vite recarga automáticamente
4. Ves los cambios en http://localhost:5173
```

### Despliegue
```
1. npm run build
   ↓
2. Vite compila todo en la carpeta dist/
   ↓
3. firebase deploy
   ↓
4. Firebase sube la carpeta dist/ a su hosting
   ↓
5. Tu app está en línea en la URL de Firebase
```

---

## 📊 Flujo de Datos

```
Usuario hace acción (predicción, voto, etc.)
         ↓
ChampionsPredictions.jsx procesa
         ↓
Llama a saveData()
         ↓
firebase.js envía datos a Firebase Cloud
         ↓
Firebase Realtime Database guarda
         ↓
Firebase notifica a todos los usuarios conectados
         ↓
onValue() en cada navegador recibe actualización
         ↓
React actualiza la interfaz automáticamente
         ↓
Todos ven los cambios en tiempo real
```

---

## 🎨 Personalización Común

### Agregar un nuevo jugador/equipo
**Archivo**: `src/ChampionsPredictions.jsx`
**Línea**: 6-23
```javascript
const teams = [
  // ... equipos existentes
  { team: 'Nuevo Equipo', player: 'Nuevo Jugador' },
];
```

### Cambiar colores del tema
**Archivo**: `src/ChampionsPredictions.jsx`
**Buscar**: `#FFD700` (oro) y `#05080F` (azul oscuro)
**Reemplazar** con tus colores favoritos

### Modificar sistema de puntos
**Archivo**: `src/ChampionsPredictions.jsx`
**Línea**: ~370-390
```javascript
// Cambia los números según prefieras
if (prediction.winner === resultWinner) {
  points += 3; // ← Modifica aquí
}
```

### Agregar nueva votación
**Archivo**: `src/ChampionsPredictions.jsx`
**Buscar**: `'best_goal'`, `'most_quiet'`, etc.
**Agregar** tu nueva categoría en esos lugares

---

## 📦 Carpetas Generadas (No editar)

### `node_modules/`
- Contiene todas las librerías instaladas
- Se crea al ejecutar `npm install`
- **NO subir a Git** (está en .gitignore)
- **NO modificar** nada aquí

### `dist/`
- Versión compilada de tu app
- Se crea al ejecutar `npm run build`
- Es lo que se sube a Firebase Hosting
- Se regenera cada vez que haces build
- **NO modificar** archivos aquí (se sobreescriben)

---

## 🎯 Archivos Esenciales (DEBES configurar)

1. ✅ `src/firebase.js` - Credenciales de Firebase
2. ⚙️ `src/ChampionsPredictions.jsx` - Equipos y jugadores

## 📝 Archivos Opcionales (Puedes modificar)

1. `src/ChampionsPredictions.jsx` - Sistema de puntos, colores
2. `src/index.css` - Estilos globales

## 🚫 Archivos que NO debes tocar

1. `package.json` (a menos que sepas qué haces)
2. `vite.config.js`
3. `src/main.jsx`
4. `index.html`
5. `firebase.json`
6. Todo en `node_modules/` y `dist/`

---

¡Con esta guía deberías entender perfectamente qué hace cada archivo! 🎉
