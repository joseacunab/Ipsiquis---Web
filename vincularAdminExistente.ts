 import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import serviceAccount from './serviceAccountKey.json' with { type: 'json' };

const app = initializeApp({
  credential: cert(serviceAccount as any),
});

const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  const [, , correo, nombre] = process.argv;

  if (!correo) {
    console.error('Uso: npx ts-node --transpile-only vincularAdminExistente.ts "correo@ejemplo.com" "Nombre (opcional)"');
    process.exit(1);
  }

  const usuario = await auth.getUserByEmail(correo);

  const refExistente = await db.collection('administradores').doc(usuario.uid).get();
  if (refExistente.exists) {
    console.log('Ya existe un documento de administrador para este UID. No se tocó nada.');
    console.log('UID:', usuario.uid);
    console.log('Contenido actual:', refExistente.data());
    process.exit(0);
  }

  await db.collection('administradores').doc(usuario.uid).set({
    nombre: nombre || usuario.displayName || correo,
    correo,
    rol: 'psicologo',
    creadoEn: FieldValue.serverTimestamp(),
  });

  console.log('Documento de administrador creado.');
  console.log('UID:', usuario.uid);
  console.log('Correo:', correo);
  console.log('Volvé a intentar el login en el panel, ya debería reconocerte como admin.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});