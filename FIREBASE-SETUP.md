# 📸 Guía Visual de Configuración Firebase

Esta guía te muestra exactamente qué hacer en Firebase con capturas de pantalla textuales.

---

## 🔷 PARTE 1: Crear Proyecto Firebase

### Paso 1.1: Ir a Firebase Console
```
URL: https://console.firebase.google.com/
```
- Si no tienes cuenta, crea una con tu Gmail
- Si ya tienes cuenta, inicia sesión

### Paso 1.2: Crear Nuevo Proyecto
```
[Interfaz de Firebase]
┌─────────────────────────────────────┐
│  Firebase Console                   │
│                                     │
│  ┌────────────────────┐            │
│  │  + Agregar proyecto│  ← Click   │
│  └────────────────────┘            │
│                                     │
└─────────────────────────────────────┘
```

### Paso 1.3: Nombrar Proyecto
```
Paso 1 de 3: Nombrar el proyecto
┌─────────────────────────────────────┐
│ Nombre del proyecto                 │
│ ┌─────────────────────────────────┐ │
│ │ champions-predictions           │ │  ← Escribir aquí
│ └─────────────────────────────────┘ │
│                                     │
│           [Continuar] ←────────────────── Click
└─────────────────────────────────────┘
```

### Paso 1.4: Google Analytics (Desactivar)
```
Paso 2 de 3: Google Analytics
┌─────────────────────────────────────┐
│ ☐ Habilitar Google Analytics       │  ← Desactivar
│                                     │
│           [Continuar] ←────────────────── Click
└─────────────────────────────────────┘
```

### Paso 1.5: Crear
```
Paso 3 de 3
┌─────────────────────────────────────┐
│  Preparando tu proyecto...          │
│                                     │
│           [Crear proyecto] ←───────────── Click
└─────────────────────────────────────┘

Espera 10-20 segundos...
```

---

## 🔷 PARTE 2: Configurar Realtime Database

### Paso 2.1: Ir a Realtime Database
```
[Menú Lateral de Firebase]
┌─────────────────────┐
│ Descripción general │
│ Analytics           │
│ Realtime Database   │ ←────── Click aquí
│ Cloud Firestore     │
│ Storage             │
└─────────────────────┘
```

### Paso 2.2: Crear Base de Datos
```
[Página de Realtime Database]
┌─────────────────────────────────────┐
│  Realtime Database                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Crear base de datos        │ ← Click
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Paso 2.3: Seleccionar Ubicación
```
Ubicación de Realtime Database
┌─────────────────────────────────────┐
│ ● Estados Unidos (us-central1)      │ ← Seleccionar ESTA
│ ○ Europa                            │
│ ○ Asia                              │
│                                     │
│           [Siguiente] ←────────────────── Click
└─────────────────────────────────────┘
```

⚠️ **MUY IMPORTANTE**: Debe ser **Estados Unidos (us-central1)**

### Paso 2.4: Reglas de Seguridad
```
Reglas de seguridad
┌─────────────────────────────────────┐
│ ● Empezar en modo de prueba         │ ← Seleccionar
│ ○ Empezar en modo bloqueado         │
│                                     │
│           [Habilitar] ←────────────────── Click
└─────────────────────────────────────┘
```

### Paso 2.5: Configurar Reglas (Importante)
```
[Pestaña "Reglas" en Realtime Database]
┌─────────────────────────────────────┐
│  Reglas    Datos    Uso             │
│  ▼                                  │
│  ┌──────────────────────────────┐  │
│  │ {                            │  │
│  │   "rules": {                 │  │  ← REEMPLAZAR TODO
│  │     ".read": true,           │  │     con este código
│  │     ".write": true           │  │
│  │   }                          │  │
│  │ }                            │  │
│  └──────────────────────────────┘  │
│                                     │
│           [Publicar] ←──────────────────── Click
└─────────────────────────────────────┘
```

---

## 🔷 PARTE 3: Obtener Credenciales

### Paso 3.1: Ir a Configuración
```
[Menú Superior]
┌─────────────────────────────────────┐
│  ⚙️ (Ícono de Engranaje)           │ ← Click
│  │                                  │
│  └─► Configuración del proyecto    │ ← Click
└─────────────────────────────────────┘
```

### Paso 3.2: Agregar App Web
```
[Sección "Tus apps"]
┌─────────────────────────────────────┐
│  Tus apps                           │
│                                     │
│  Agrega Firebase a tu aplicación    │
│  para empezar                       │
│                                     │
│  [iOS]  [Android]  [</>Web]  [Unity]│
│                     ↑               │
│                     └─ Click aquí   │
└─────────────────────────────────────┘
```

### Paso 3.3: Registrar App
```
Agregar Firebase a tu app web
┌─────────────────────────────────────┐
│ Sobrenombre de la app               │
│ ┌─────────────────────────────────┐ │
│ │ Champions Predictions           │ │ ← Escribir
│ └─────────────────────────────────┘ │
│                                     │
│ ☐ Configurar Firebase Hosting      │ ← NO marcar
│                                     │
│      [Registrar app] ←──────────────────── Click
└─────────────────────────────────────┘
```

### Paso 3.4: COPIAR Credenciales (IMPORTANTE)
```
Agregar el SDK de Firebase
┌─────────────────────────────────────┐
│ Usa este código en tu aplicación:   │
│                                     │
│ const firebaseConfig = {            │
│   apiKey: "AIzaSyB...",            │ ← COPIAR
│   authDomain: "champions-pred...", │   TODO
│   databaseURL: "https://champ...", │   ESTO
│   projectId: "champions-pred...",  │
│   storageBucket: "champions...",   │
│   messagingSenderId: "12345...",   │
│   appId: "1:12345:web:abc..."     │
│ };                                  │
│                                     │
│      [Copiar]  [Continuar]         │
└─────────────────────────────────────┘
```

⚠️ **CRÍTICO**: Copia TODO el bloque `firebaseConfig`

---

## 🔷 PARTE 4: Actualizar tu Código

### Paso 4.1: Abrir src/firebase.js
```
Busca en tu proyecto:
📁 champions-predictions/
  📁 src/
    📄 firebase.js  ← Abrir este archivo
```

### Paso 4.2: Reemplazar Valores
```javascript
// ANTES (valores por defecto):
const firebaseConfig = {
  apiKey: "TU_API_KEY",           // ❌
  authDomain: "TU_PROJECT_ID...", // ❌
  databaseURL: "https://TU...",   // ❌
  ...
};

// DESPUÉS (pegar tus valores):
const firebaseConfig = {
  apiKey: "AIzaSyB_tu_key_real",        // ✅
  authDomain: "tu-proyecto.firebase..", // ✅
  databaseURL: "https://tu-proyecto...", // ✅
  ...
};
```

### Paso 4.3: Verificar databaseURL
⚠️ **IMPORTANTE**: La URL debe terminar en `.firebaseio.com`

```javascript
// ✅ CORRECTO:
databaseURL: "https://champions-predictions-default-rtdb.firebaseio.com"

// ❌ INCORRECTO (falta el subdominio):
databaseURL: "https://champions-predictions.firebaseio.com"
```

---

## 🔷 PARTE 5: Verificar que Funciona

### Paso 5.1: Ejecutar Localmente
```bash
npm install
npm run dev
```

Abrir: http://localhost:5173

### Paso 5.2: Hacer una Prueba
1. Selecciona un usuario
2. Haz una predicción
3. Ve a Firebase Console → Realtime Database → Pestaña "Datos"

### Paso 5.3: Verificar en Firebase
```
[Firebase Console - Realtime Database - Datos]
┌─────────────────────────────────────┐
│  championsData                      │
│    ▼ predictions                    │  ← Deberías ver
│        ▼ match_123                  │    tus datos aquí
│            player1: {...}           │
│    ▼ matches                        │
│    ▼ groups                         │
└─────────────────────────────────────┘
```

Si ves datos aquí → ✅ **¡FUNCIONA!**

---

## 🎯 Checklist Final

Antes de compartir con tus amigos, verifica:

- [ ] Proyecto creado en Firebase
- [ ] Realtime Database creado en **us-central1**
- [ ] Reglas configuradas (`.read: true`, `.write: true`)
- [ ] Credenciales copiadas y pegadas en `src/firebase.js`
- [ ] `databaseURL` correcta (termina en `.firebaseio.com`)
- [ ] Probado localmente y funciona
- [ ] Datos se ven en Firebase Console
- [ ] Subido a GitHub
- [ ] Desplegado en Vercel
- [ ] Probado en 2 dispositivos diferentes y se sincroniza

---

## 🚨 Errores Comunes

### Error: "Permission denied"
```
Solución:
1. Firebase Console → Realtime Database → Reglas
2. Verificar que diga:
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
3. Click "Publicar"
```

### Error: "Database not found"
```
Solución:
1. Verificar que databaseURL sea correcta
2. Debe ser: https://TU-PROYECTO-default-rtdb.firebaseio.com
3. Debe incluir "-default-rtdb"
4. Debe terminar en ".firebaseio.com"
```

### Error: No se sincronizan los cambios
```
Solución:
1. Abrir consola del navegador (F12)
2. Buscar errores de Firebase
3. Verificar conexión a internet
4. Recargar la página
```

---

## 🎉 ¡Listo!

Si llegaste hasta aquí y todo funciona, tu app está lista para compartir con tus amigos. 

**Tu link será algo como:**
`https://champions-predictions.vercel.app`

Todos los que entren a ese link compartirán la misma base de datos en tiempo real. ⚽🏆
