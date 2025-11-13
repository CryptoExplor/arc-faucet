export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const API_KEY = process.env.CIRCLE_API_KEY; // Hidden securely on Vercel

    const { address, usdc, eurc } = req.body;

    const faucetBody = {
      address,
      blockchain: "ARC-TESTNET",
      usdc,
      eurc,
    };

    const response = await fetch("https://api.circle.com/v1/faucet/drips", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(faucetBody),
    });

    const data = await response.text();
    res.status(200).send(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
