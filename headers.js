export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { domain } = req.body;
  if (!domain) {
    return res.status(400).json({ error: "Domain is required" });
  }

  try {
    const response = await fetch(`https://securityheaders.com/?q=${domain}&followRedirects=on`, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
    });
    const html = await response.text();

    // Extract score using regex
    const match = html.match(/Grade:\s*<\/th>\s*<td[^>]*>\s*<div[^>]*>(.*?)<\/div>/);
    const grade = match ? match[1] : "Not found";

    res.status(200).json({ domain, grade });
  } catch (error) {
    res.status(500).json({ error: "Header scan failed", details: error.message });
  }
}
