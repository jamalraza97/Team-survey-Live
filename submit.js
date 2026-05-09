const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { ratings, suggestions } = body;

    if (!ratings || typeof ratings !== 'object') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid payload' }) };
    }

    const store = getStore('survey-responses');
    const id = `response-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await store.set(id, JSON.stringify({
      id,
      timestamp: new Date().toISOString(),
      ratings,
      suggestions: suggestions || {},
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, id }),
    };
  } catch (err) {
    console.error('Submit error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
