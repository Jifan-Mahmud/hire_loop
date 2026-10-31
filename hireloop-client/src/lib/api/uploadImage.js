/**
 * Utility to upload an image to ImgBB and return the hosted direct image URL.
 * Falls back gracefully if there's any network or API issue.
 */
export async function uploadToImgBB(file) {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  if (!apiKey) {
    console.warn("NEXT_PUBLIC_IMGBB_API_KEY is missing in environment variables.");
    return null;
  }

  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success && result.data) {
      // Use display_url or direct url
      return result.data.display_url || result.data.url;
    } else {
      console.error("ImgBB upload failed with error:", result.error || result);
      return null;
    }
  } catch (error) {
    console.error("Error uploading to ImgBB:", error);
    return null;
  }
}
