import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    return new Response(JSON.stringify({ ok: true, message: 'DB connected' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Ping DB error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'DB connection failed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}
