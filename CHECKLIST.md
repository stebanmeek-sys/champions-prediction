# ✅ CHECKLIST DE CONFIGURACIÓN

Usa esta lista para verificar que todo está correctamente configurado:

## 📦 Instalación Inicial

- [ ] Descargué la carpeta `champions-predictions`
- [ ] Abrí una terminal en esa carpeta
- [ ] Ejecuté `npm install` y se instaló sin errores
- [ ] Veo la carpeta `node_modules` creada

## 🔥 Configuración de Firebase

### Proyecto Firebase
- [ ] Creé un proyecto en https://console.firebase.google.com/
- [ ] Registré una app web en mi proyecto
- [ ] Copié la configuración de Firebase

### Archivo firebase.js
- [ ] Abrí el archivo `src/firebase.js`
- [ ] Reemplacé `"TU_API_KEY"` con mi apiKey real
- [ ] Reemplacé `"TU_PROJECT_ID"` con mi projectId real (en 3 lugares)
- [ ] Reemplacé todos los demás valores `"TU_..."` con los valores reales
- [ ] Guardé el archivo

### Realtime Database
- [ ] En Firebase Console, fui a "Realtime Database"
- [ ] Creé una base de datos en modo de prueba
- [ ] Copié la URL de mi database (ej: `https://mi-proyecto-default-rtdb.firebaseio.com`)
- [ ] Verifiqué que esa URL esté en `databaseURL` de mi `firebase.js`

### Reglas de Seguridad
- [ ] En "Realtime Database" > "Reglas"
- [ ] Las reglas dicen `.read: true` y `.write: true`
- [ ] Hice clic en "Publicar"

## 🧪 Prueba Local

- [ ] Ejecuté `npm run dev`
- [ ] La app abrió en http://localhost:5173
- [ ] Puedo seleccionar un usuario
- [ ] No veo errores en la consola del navegador (F12)
- [ ] Puedo hacer una predicción de prueba
- [ ] Cierro y abro el navegador, y mis datos siguen ahí

## 🚀 Despliegue

### Firebase CLI
- [ ] Instalé Firebase CLI: `npm install -g firebase-tools`
- [ ] Ejecuté `firebase login` y me autentiqué
- [ ] Ejecuté `firebase init`
- [ ] Seleccioné "Hosting"
- [ ] Elegí mi proyecto existente
- [ ] Configuré `dist` como directorio público
- [ ] Configuré como single-page app (Yes)

### Build y Deploy
- [ ] Ejecuté `npm run build`
- [ ] Se creó la carpeta `dist`
- [ ] Ejecuté `firebase deploy`
- [ ] El deploy se completó sin errores
- [ ] Firebase me dio una URL (ej: `https://mi-proyecto.web.app`)

## ✨ Verificación Final

### Desde mi navegador (desktop)
- [ ] Abro la URL de Firebase Hosting
- [ ] Puedo seleccionar un usuario
- [ ] Puedo hacer una predicción
- [ ] Puedo acceder como admin con `admin123`
- [ ] Como admin puedo crear un grupo

### Desde mi celular
- [ ] Abro la misma URL en mi celular
- [ ] Veo los mismos datos que en desktop
- [ ] Si hago un cambio en desktop, lo veo en el celular (y viceversa)

### Con un amigo
- [ ] Comparto la URL con un amigo
- [ ] Mi amigo puede abrir la app
- [ ] Mi amigo selecciona su usuario
- [ ] Cuando mi amigo hace algo, yo lo veo en mi pantalla
- [ ] Cuando yo hago algo, mi amigo lo ve en su pantalla

## 🎮 Funcionalidad Completa

### Como Jugador
- [ ] Puedo ver los partidos habilitados
- [ ] Puedo hacer predicciones
- [ ] Puedo ver la clasificación
- [ ] Puedo participar en votaciones cuando están activas
- [ ] Puedo ver mi hora de llegada si fue registrada

### Como Admin (contraseña: admin123)
- [ ] Puedo crear grupos
- [ ] Puedo crear partidos
- [ ] Puedo habilitar partidos
- [ ] Puedo registrar resultados
- [ ] Los puntos se calculan automáticamente
- [ ] Puedo registrar horas de llegada
- [ ] Puedo agregar goles para votaciones
- [ ] Puedo abrir y cerrar votaciones
- [ ] Puedo ver resultados de votaciones

## ❌ Si algo no funciona

### Error: "Firebase not configured"
→ Revisa el archivo `src/firebase.js`, asegúrate de haber reemplazado TODOS los valores `"TU_..."`

### Error: "Permission denied"
→ Ve a Firebase Console > Realtime Database > Reglas
→ Asegúrate de que `.read` y `.write` estén en `true`

### Los cambios no se sincronizan entre usuarios
→ Abre la consola del navegador (F12)
→ Busca errores de Firebase
→ Verifica que la URL de database sea correcta

### La app no carga después del deploy
→ Verifica que existe la carpeta `dist`
→ Intenta: `npm run build && firebase deploy`
→ Limpia el cache del navegador (Ctrl+Shift+R)

### No puedo hacer login como admin
→ Por defecto la contraseña es `admin123`
→ Si la cambiaste, busca en `src/ChampionsPredictions.jsx` línea ~237

## 📞 Todo Listo!

Si marcaste todas las casillas, ¡tu app está lista para usar! 🎉

**URL para compartir**: __________________________
(escribe aquí tu URL de Firebase Hosting)

**Contraseña Admin**: `admin123`

¡Disfruta tu app de predicciones! ⚽🏆
