// File: api/ssl-expiry.js

import tls from "tls";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { domain } = req.body;

  if (!domain) {
    return res.status(400).json({ error: "Domain is required" });
  }

  const host = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");

  try {
    const socket = tls.connect(
      {
        host,
        port: 443,
        servername: host,
        rejectUnauthorized: false,
      },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();

        if (!cert || !cert.valid_to) {
          return res.status(500).json({ error: "Could not retrieve certificate" });
        }

        return res.status(200).json({
          domain: host,
          expiresOn: cert.valid_to,
          issuer: cert.issuer,
          subject: cert.subject,
        });
      }
    );

    socket.on("error", (err) => {
      res.status(500).json({ error: "TLS Error", details: err.message });
    });
  } catch (err) {
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
}
