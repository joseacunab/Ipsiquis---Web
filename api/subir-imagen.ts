export const config = { runtime: 'edge' };

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Método no permitido', { status: 405 });
  }

  const clave = request.headers.get('X-Clave-Subida');
  if (clave !== process.env.CLAVE_SUBIDA) {
    return new Response('No autorizado', { status: 401 });
  }

  const formData = await request.formData();
  const archivo = formData.get('archivo') as File | null;
  if (!archivo) {
    return new Response('Falta el archivo', { status: 400 });
  }

  const extension = archivo.name.split('.').pop();
  const nombreUnico = `${crypto.randomUUID()}.${extension}`;

  const respuestaSupabase = await fetch(
    `${process.env.SUPABASE_URL}/storage/v1/object/imagenes/${nombreUnico}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
        'Content-Type': archivo.type,
      },
      body: archivo.stream(),
    }
  );

  if (!respuestaSupabase.ok) {
    const error = await respuestaSupabase.text();
    return new Response(`Error subiendo a Supabase: ${error}`, { status: 500 });
  }

  const urlPublica = `${process.env.SUPABASE_URL}/storage/v1/object/public/imagenes/${nombreUnico}`;
  return new Response(JSON.stringify({ url: urlPublica }), {
    headers: { 'Content-Type': 'application/json' },
  });
}