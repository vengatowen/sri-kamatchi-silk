const path = require("path");

const uploadImage = async (req, res) => {
  try {
    const { type } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const cpanelUploadUrl = process.env.CPANEL_UPLOAD_URL;
    const cpanelUploadSecret = process.env.CPANEL_UPLOAD_SECRET;

    if (!cpanelUploadUrl || !cpanelUploadSecret) {
      return res.status(500).json({
        success: false,
        message: "Server is not configured for image uploads (missing cPanel configuration)",
      });
    }

    // Build multipart form data to send to the PHP receiver
    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append("file", blob, req.file.originalname);
    formData.append("type", type);

    const uploadResponse = await fetch(cpanelUploadUrl, {
      method: "POST",
      headers: {
        "X-Upload-Secret": cpanelUploadSecret,
      },
      body: formData,
    });

    let uploadData;
    const contentType = uploadResponse.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      uploadData = await uploadResponse.json();
    } else {
      const text = await uploadResponse.text();
      uploadData = { message: text };
    }

    if (!uploadResponse.ok || !uploadData.success) {
      return res.status(uploadResponse.status || 500).json({
        success: false,
        message: uploadData.message || "Failed to upload image to cPanel",
        error: uploadData,
      });
    }

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: uploadData.imageUrl,
      fileName: uploadData.fileName,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Image upload failed due to internal error",
      error: error.message,
    });
  }
};

module.exports = {
  uploadImage,
};
