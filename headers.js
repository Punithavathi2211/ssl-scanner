export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: "Domain is required" });

  const cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0];

  try {
    // Trigger scan
    await fetch(`https://http-observatory.security.mozilla.org/api/v1/analyze?host=${cleanDomain}`, {
      method: "POST"
    });

    // Wait 5 seconds (scan time)
    await new Promise((r) => setTimeout(r, 5000));

    // Get result
    const result = await fetch(`https://http-observatory.security.mozilla.org/api/v1/analyze?host=${cleanDomain}`);
    const data = await result.json();

    res.status(200).json({ grade: data.grade || "Unavailable" });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch headers", message: err.message });
  }
}
