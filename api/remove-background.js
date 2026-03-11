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

    const { imageBase64, mimeType } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64." });
    }

    const safeMimeType = mimeType || "image/jpeg";
    const extension = safeMimeType.includes("png") ? "png" : "jpg";

    const cleanBase64 = String(imageBase64).replace(
      /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
      ""
    );

    const imageBuffer = Buffer.from(cleanBase64, "base64");
    const imageBlob = new Blob([imageBuffer], { type: safeMimeType });

    const formData = new FormData();
    formData.append("size", "auto");
    formData.append("image_file", imageBlob, `wardrobe-item.${extension}`);

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({
        error: "remove.bg request failed",
        details: errorText,
      });
    }

    const resultArrayBuffer = await response.arrayBuffer();
    const resultBase64 = Buffer.from(resultArrayBuffer).toString("base64");

    return res.status(200).json({
      imageUrl: `data:image/png;base64,${resultBase64}`,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error?.message || "Unknown error",
    });
  }
}
