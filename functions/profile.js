exports.handler = async (event) => {
  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};
  if (method === 'GET') {
    return { statusCode: 200, body: JSON.stringify({ ok: true, profile: { email: body.email || 'demo@you', name: 'Demo', bio: 'Preview profile', avatarUrl: null }}) };
  }
  if (method === 'PUT') {
    return { statusCode: 200, body: JSON.stringify({ ok: true, saved: body }) };
  }
  return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };
}
