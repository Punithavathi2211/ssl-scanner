import tls from "tls";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { domain } = req.body;
  if (!domain) {
    return res.status(400).json({ error: "Domain required" });
  }

  try {
    const options = {
      host: domain,
      port: 443,
      servername: domain,
      rejectUnauthorized: false,
    };

    const socket = tls.connect(options, () => {
      const cert = socket.getPeerCertificate();
      socket.end();

      if (!cert.valid_to) {
        return res.status(500).json({ error: "Could not retrieve certificate" });
      }

      res.status(200).json({
        domain,
        expiresOn: cert.valid_to,
        issuer: cert.issuer,
        subject: cert.subject,
      });
    });

    socket.on("error", (err) => {
      res.status(500).json({ error: "TLS Error", details: err.message });
    });
  } catch (error) {
    res.status(500).json({ error: "Unexpected error", details: error.message });
  }
}
