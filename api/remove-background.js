export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.REMOVE_BG_API_KEY;

    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Missing REMOVE_BG_API_KEY environment variable." });
    }

    const { imageUrl } = req.body || {};

    if (!imageUrl) {
      return res.status(400).json({ error: "Missing imageUrl." });
    }

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: imageUrl,
        size: "auto",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error });
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return res.status(200).json({
      imageUrl: `data:image/png;base64,${base64}`,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
}
