const { getStore } = require('@netlify/blobs');

const MEMBERS = ['宋玉仪', '周雪梅', '郭星星', '黄乔珍', '吴超', '曾淑娴'];
const DIM_KEYS = ['contrib', 'collab', 'expertise', 'reliability', 'climate'];
const Q_KEYS = DIM_KEYS.flatMap(d => [`${d}_q1`, `${d}_q2`]);

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
    const { password } = JSON.parse(event.body);
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || password !== adminPassword) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const store = getStore('survey-responses');
    const { blobs } = await store.list();

    const responses = [];
    for (const blob of blobs) {
      try {
        const data = await store.get(blob.key, { type: 'json' });
        if (data) responses.push(data);
      } catch (e) {
        console.warn('Failed to read blob:', blob.key, e.message);
      }
    }

    // Aggregate scores per member per question key
    const aggregated = {};
    MEMBERS.forEach(m => {
      aggregated[m] = {
        scores: Object.fromEntries(Q_KEYS.map(k => [k, []])),
        suggestions: [],
      };
    });

    responses.forEach(r => {
      MEMBERS.forEach(m => {
        const memberRatings = r.ratings?.[m];
        if (memberRatings) {
          Q_KEYS.forEach(k => {
            const v = memberRatings[k];
            if (v && !isNaN(Number(v))) {
              aggregated[m].scores[k].push(Number(v));
            }
          });
        }
        const sug = r.suggestions?.[m];
        if (sug && sug.trim()) {
          aggregated[m].suggestions.push(sug.trim());
        }
      });
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        totalResponses: responses.length,
        aggregated,
      }),
    };
  } catch (err) {
    console.error('Get-results error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
