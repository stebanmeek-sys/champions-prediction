# ⚽ Champions League - Predicciones

Aplicación web para predicciones de la Champions League con datos compartidos en tiempo real entre todos los usuarios.

## 🚀 Características

- ✅ Predicciones de partidos en tiempo real
- ✅ Sistema de puntos compartido
- ✅ Panel de administración
- ✅ Votaciones y clasificaciones
- ✅ Sincronización automática entre usuarios
- ✅ Base de datos Firebase (todos los usuarios ven los mismos datos)

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Firebase (gratuita)
- Cuenta de GitHub (opcional pero recomendado)
- Cuenta de Vercel (opcional, para deployment)

## 🔧 Configuración de Firebase

### Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Agregar proyecto" / "Add project"
3. Nombre: "champions-predictions" (o el que prefieras)
4. Desactiva Google Analytics (no es necesario)
5. Click en "Crear proyecto"

### Paso 2: Configurar Realtime Database

1. En el menú lateral, busca "Realtime Database"
2. Click en "Crear base de datos"
3. **IMPORTANTE**: Selecciona ubicación **Estados Unidos (us-central1)**
4. Inicia en **modo de prueba** (permite lectura/escritura sin autenticación)
5. Click en "Habilitar"

### Paso 3: Configurar Reglas de Seguridad

En la pestaña "Reglas", reemplaza todo con esto:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **NOTA**: Estas reglas permiten acceso público. Para producción considera agregar autenticación.

### Paso 4: Obtener Credenciales

1. Click en el ícono de configuración ⚙️ (junto a "Descripción general del proyecto")
2. Click en "Configuración del proyecto"
3. En la sección "Tus apps", click en el botón `</> Web`
4. Registra la app con nombre "Champions Predictions"
5. Copia las credenciales que aparecen

### Paso 5: Actualizar Configuración Local

Abre el archivo `src/firebase.js` y reemplaza los valores con tus credenciales:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

## 💻 Instalación Local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:5173
```

## 🌐 Deployment con Vercel (Recomendado)

### Opción 1: Deploy desde GitHub (Recomendado)

1. **Crear repositorio en GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/champions-predictions.git
   git push -u origin main
   ```

2. **Conectar con Vercel:**
   - Ve a [Vercel](https://vercel.com)
   - Click en "Add New" → "Project"
   - Importa tu repositorio de GitHub
   - Click en "Deploy"
   - ¡Listo! Tu app estará en: `https://tu-proyecto.vercel.app`

### Opción 2: Deploy directo desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

## 🔗 Compartir con Amigos

Una vez desplegado en Vercel, simplemente comparte el link:
- `https://tu-proyecto.vercel.app`

Todos los usuarios que entren a ese link compartirán:
- ✅ Los mismos grupos
- ✅ Los mismos partidos
- ✅ Las mismas predicciones
- ✅ Los mismos puntos
- ✅ Todo actualizado en tiempo real

## 👥 Uso de la Aplicación

### Para Usuarios Normales:
1. Selecciona tu nombre en la lista
2. Ve a "Predicciones" para hacer tus pronósticos
3. Ve a "Clasificación" para ver los puntos

### Para Admin:
1. Click en "Admin" en el menú
2. Ingresar contraseña: `champions2024`
3. Podrás:
   - Crear grupos y partidos
   - Habilitar partidos para predicciones
   - Registrar resultados
   - Gestionar votaciones
   - Registrar horas de llegada

## 🎮 Funcionalidades

### Predicciones
- Predecir ganador del partido
- Predecir marcador exacto
- Predecir primer goleador
- Ver predicciones de otros usuarios

### Clasificación
- Ranking por puntos
- Ranking por llegada (hora de llegada al evento)
- Historial de predicciones

### Panel Admin
- Gestión de grupos
- Creación de partidos
- Habilitación de predicciones
- Registro de resultados
- Sistema de votaciones
- Registro de llegadas

### Votaciones
- Mejor gol
- Más callado
- Más chistoso
- Revelación
- Balón de oro

## 🛠️ Tecnologías

- **React** 18.3 - Framework de UI
- **Vite** 5.0 - Build tool
- **Firebase** - Base de datos en tiempo real
- **Lucide React** - Iconos
- **Vercel** - Hosting

## 📁 Estructura del Proyecto

```
champions-predictions/
├── src/
│   ├── ChampionsLeagueApp.jsx  # Componente principal
│   ├── firebase.js              # Configuración Firebase
│   ├── main.jsx                 # Entry point
│   └── index.css                # Estilos globales
├── index.html                   # HTML template
├── package.json                 # Dependencias
├── vite.config.js              # Configuración Vite
└── README.md                    # Este archivo
```

## 🔐 Seguridad

La contraseña de admin por defecto es `champions2024`. Para cambiarla, busca en `ChampionsLeagueApp.jsx` la línea:

```javascript
if (adminPassword === 'champions2024') {
```

Y cambia `'champions2024'` por tu contraseña deseada.

## 🐛 Solución de Problemas

### No se guardan los datos
- Verifica que las credenciales de Firebase estén correctas
- Revisa que las reglas de Firebase permitan lectura/escritura
- Abre la consola del navegador para ver errores

### No se ven los cambios en tiempo real
- Verifica tu conexión a internet
- Recarga la página (F5)
- Verifica en Firebase Console que los datos se estén guardando

### Error al hacer deploy en Vercel
- Asegúrate de que `src/firebase.js` tenga las credenciales correctas
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de Vercel para más detalles

## 📞 Soporte

Si tienes problemas, revisa:
1. La consola del navegador (F12)
2. Los logs de Vercel (si está desplegado)
3. La consola de Firebase

## 📝 Notas Importantes

- ⚠️ **Las reglas de Firebase actuales permiten acceso público** - todos pueden leer y escribir
- 💡 Para una versión de producción considera agregar autenticación de Firebase
- 🔄 Los cambios se sincronizan automáticamente entre todos los usuarios conectados
- 💾 No se necesita botón "Guardar" - todo se guarda automáticamente en Firebase

## 🎉 ¡Listo!

Tu aplicación está lista para usar. Comparte el link con tus amigos y disfruten prediciendo la Champions League juntos! ⚽🏆
