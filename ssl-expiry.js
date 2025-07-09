export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { domain } = req.body;
  if (!domain) {
    return res.status(400).json({ error: "Domain is required" });
  }

  try {
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const response = await fetch(`https://api.devopsclub.in/api/ssl-check?domain=${cleanDomain}`);
    const data = await response.json();

    if (data && data.valid_to) {
      res.status(200).json({
        domain,
        expiresOn: data.valid_to,
        validFrom: data.valid_from,
        issuer: data.issuer,
        isValid: data.is_valid
      });
    } else {
      res.status(500).json({ error: "Invalid response from SSL API" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch SSL data", message: err.message });
  }
}
