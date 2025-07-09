export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { domain } = req.body;
  if (!domain) {
    return res.status(400).json({ error: "Domain is required" });
  }

  const apiUrl = `https://api.ssllabs.com/api/v3/analyze?host=${domain}&publish=off&all=done`;

  try {
    // First attempt to trigger the analysis
    let response = await fetch(apiUrl, { method: "GET" });
    let data = await response.json();

    // Wait for scan to finish (max retries: 10)
    let retries = 0;
    while (data.status !== "READY" && retries < 10) {
      await new Promise((r) => setTimeout(r, 5000)); // wait 5 seconds
      response = await fetch(apiUrl, { method: "GET" });
      data = await response.json();
      retries++;
    }

    const endpoint = data?.endpoints?.[0];
    const grade = endpoint?.grade || "Unavailable";

    const expiryEpoch = endpoint?.details?.cert?.notAfter;
    const expiryDate = expiryEpoch ? new Date(expiryEpoch).toUTCString() : "Unavailable";

    return res.status(200).json({
      domain,
      grade,
      expiresOn: expiryDate
    });

  } catch (err) {
    return res.status(500).json({ error: "SSL Labs scan failed", message: err.message });
  }
}
