import getSSLCertificate from "get-ssl-certificate";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { domain } = req.body;
  if (!domain) {
    return res.status(400).json({ error: "Domain required" });
  }

  try {
    const cert = await getSSLCertificate.get(domain);
    res.status(200).json({
      domain,
      expiresOn: cert.valid_to,
      issuer: cert.issuer,
      subject: cert.subject,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch SSL certificate", details: error.message });
  }
}
