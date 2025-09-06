// This file is your secure backend. It should be placed in an /api directory
// and deployed on a service that supports Node.js serverless functions (like Vercel).

export default async function handler(request, response) {
  // 1. Get the 'sport' from the query parameter sent by your website.
  const { sport } = request.query;

  // 2. Access your secret API key from an environment variable on the server.
  // This is the secure part - it's never visible to the public.
  const apiKey = process.env.ODDS_API_KEY;

  // --- Error Handling ---
  if (!apiKey) {
    // This error will show if you forget to set up the environment variable on Vercel.
    return response.status(500).json({ error: 'API key is not configured on the server.' });
  }
  if (!sport) {
    return response.status(400).json({ error: 'Sport parameter is missing from the request.' });
  }

  // 3. Construct the secure URL to call The Odds API.
  const apiUrl = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=us&markets=h2h,spreads&oddsFormat=american&apiKey=${apiKey}`;

  try {
    // 4. Fetch the data from The Odds API from your secure server.
    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      // If The Odds API sends an error, forward it to your website.
      return response.status(apiResponse.status).json({ error: errorData.message || 'Failed to fetch odds from the provider.' });
    }

    // 5. If the call is successful, send the data back to your website.
    const data = await apiResponse.json();
    
    // Set CORS headers to allow your WordPress site to call this function.
    // For production, you should replace '*' with 'https://cesstalkssports.com' for better security.
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return response.status(200).json(data);

  } catch (error) {
    console.error("Backend Error:", error);
    return response.status(500).json({ error: 'An internal server error occurred.' });
  }
}

