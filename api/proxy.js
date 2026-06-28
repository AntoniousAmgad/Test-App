module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetUrl = req.query && req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }

  let body;
  if (req.body !== undefined) {
    body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }

  try {
    let url = targetUrl;
    let response;

    // Follow redirects manually to preserve POST method and body.
    // Default fetch behavior changes POST to GET on 302, which drops the body.
    for (let i = 0; i < 5; i++) {
      response = await fetch(url, {
        method: req.method,
        headers: {
          'Content-Type': req.headers['content-type'] || 'application/json',
        },
        body: req.method !== 'GET' ? body : undefined,
        redirect: 'manual',
      });

      const location = response.headers.get('location');
      if (location && response.status >= 300 && response.status < 400) {
        url = location;
        continue;
      }
      break;
    }

    const responseText = await response.text();
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.send(responseText);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Proxy request failed' });
  }
};
