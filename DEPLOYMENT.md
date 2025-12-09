# 📦 Guía de Deployment - GitHub + Vercel

## 🔷 OPCIÓN 1: Deployment con GitHub + Vercel (Recomendado)

Esta es la mejor opción porque:
- ✅ Control de versiones
- ✅ Backups automáticos
- ✅ Rollback fácil si algo sale mal
- ✅ Vercel auto-deploys cuando haces push

### Paso 1: Crear Repositorio en GitHub

#### 1.1 Desde tu computadora (Terminal):

```bash
# Inicializar Git en tu proyecto
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Initial commit - Champions Predictions"

# Renombrar branch a main
git branch -M main
```

#### 1.2 En GitHub Web:

1. Ve a https://github.com/new
2. Nombre del repositorio: `champions-predictions`
3. Descripción: `Aplicación de predicciones Champions League`
4. Visibilidad: **Público** o **Privado** (tu elección)
5. **NO** marcar "Add README" (ya lo tienes)
6. Click "Create repository"

#### 1.3 Conectar y subir:

GitHub te mostrará los comandos, serán algo así:

```bash
# Conectar tu repo local con GitHub
git remote add origin https://github.com/TU_USUARIO/champions-predictions.git

# Subir tu código
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. Ve a https://vercel.com
2. Login con GitHub (o crear cuenta)
3. Click "Add New" → "Project"
4. Busca tu repositorio `champions-predictions`
5. Click "Import"
6. **NO cambies nada** (Vercel detecta Vite automáticamente)
7. Click "Deploy"
8. Espera 1-2 minutos
9. ✅ **¡Listo!** Te dará un link como: `https://champions-predictions-abc123.vercel.app`

### Paso 3: Compartir

Tu app estará en:
```
https://champions-predictions-abc123.vercel.app
```

Comparte este link con tus amigos. Todos verán los mismos datos en tiempo real.

---

## 🔷 OPCIÓN 2: Deployment Directo con Vercel CLI

Si no quieres usar GitHub, puedes deployar directamente:

### Instalación:

```bash
# Instalar Vercel CLI
npm install -g vercel
```

### Deploy:

```bash
# Desde la carpeta del proyecto
cd champions-predictions

# Login en Vercel
vercel login

# Deploy (modo preview)
vercel

# O deploy directo a producción
vercel --prod
```

---

## 📝 Comandos Git Útiles

### Comandos Básicos:

```bash
# Ver estado de los archivos
git status

# Agregar cambios específicos
git add src/ChampionsLeagueApp.jsx
git add src/firebase.js

# Agregar todos los cambios
git add .

# Hacer commit
git commit -m "Descripción del cambio"

# Subir a GitHub
git push

# Ver historial de commits
git log --oneline
```

### Actualizar tu App:

Cada vez que hagas cambios:

```bash
# 1. Guardar cambios
git add .

# 2. Hacer commit
git commit -m "Actualización: descripción del cambio"

# 3. Subir a GitHub
git push

# 4. Vercel hace auto-deploy (espera 1-2 minutos)
```

### Revertir Cambios:

```bash
# Ver commits anteriores
git log --oneline

# Volver a un commit anterior (ejemplo)
git reset --hard abc1234

# Forzar push (ten cuidado con esto)
git push --force
```

---

## 🔄 Workflow de Desarrollo

### Hacer cambios y actualizar:

```bash
# 1. Hacer cambios en tu código (ej. en VSCode)

# 2. Probar localmente
npm run dev

# 3. Si funciona bien, commitear
git add .
git commit -m "Fix: corrección en sistema de puntos"

# 4. Subir a GitHub
git push

# 5. Vercel hace deploy automático
# Ve a vercel.com/dashboard para ver el progreso
```

### Trabajar en features nuevas:

```bash
# Crear nueva branch para feature
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y commits
git add .
git commit -m "Add: nueva funcionalidad"

# Cuando esté lista, mergear a main
git checkout main
git merge feature/nueva-funcionalidad
git push
```

---

## 🎯 Configuración de Variables de Entorno en Vercel

Si decides usar variables de entorno en vez de hardcodear las credenciales de Firebase:

### En Vercel Dashboard:

1. Ve a tu proyecto en vercel.com
2. Settings → Environment Variables
3. Agregar cada variable:

```
VITE_FIREBASE_API_KEY = tu_valor_aqui
VITE_FIREBASE_AUTH_DOMAIN = tu_valor_aqui
VITE_FIREBASE_DATABASE_URL = tu_valor_aqui
VITE_FIREBASE_PROJECT_ID = tu_valor_aqui
VITE_FIREBASE_STORAGE_BUCKET = tu_valor_aqui
VITE_FIREBASE_MESSAGING_SENDER_ID = tu_valor_aqui
VITE_FIREBASE_APP_ID = tu_valor_aqui
```

4. Redeploy desde el dashboard

---

## 🚨 Troubleshooting

### El deploy falla:

```bash
# Ver los logs en Vercel dashboard
# O desde CLI:
vercel logs
```

### GitHub no acepta el push:

```bash
# Si dice "Permission denied":
# 1. Verifica tus credenciales
git remote -v

# 2. O usa HTTPS en vez de SSH:
git remote set-url origin https://github.com/TU_USUARIO/champions-predictions.git
```

### Vercel no detecta cambios:

1. Ve a vercel.com/dashboard
2. Selecciona tu proyecto
3. Deployments
4. Click en el último deployment → "Redeploy"

---

## 🔗 URLs Importantes

Después del deployment tendrás:

1. **GitHub Repo**: `https://github.com/TU_USUARIO/champions-predictions`
2. **Vercel Project**: `https://vercel.com/tu-usuario/champions-predictions`
3. **App Live**: `https://champions-predictions.vercel.app` (tu link personalizado)

---

## 💡 Tips Pro

### Custom Domain (Opcional):

Si tienes un dominio propio:

1. Vercel Dashboard → Settings → Domains
2. Agregar: `champions.tudominio.com`
3. Seguir instrucciones de DNS

### Rollback rápido:

Si algo sale mal:

1. Vercel Dashboard → Deployments
2. Encuentra un deployment anterior que funcionaba
3. Click "..." → "Promote to Production"

### Branches de staging:

```bash
# Crear branch de staging
git checkout -b staging

# Vercel auto-crea preview URL para cada branch
# URL será: https://champions-predictions-git-staging-usuario.vercel.app
```

---

## ✅ Checklist Pre-Deployment

Antes de hacer push:

- [ ] Código funciona localmente (`npm run dev`)
- [ ] Firebase está configurado correctamente
- [ ] `.gitignore` incluye `node_modules` y `.env`
- [ ] `README.md` está actualizado
- [ ] Contraseña de admin es la correcta
- [ ] No hay credenciales sensibles expuestas

---

## 🎉 ¡Todo Listo!

Con esta configuración:

1. Haces cambios localmente
2. Los pruebas con `npm run dev`
3. Haces `git push`
4. Vercel auto-deploys
5. Tus amigos ven los cambios en 1-2 minutos

Es tan simple como eso. ⚡
