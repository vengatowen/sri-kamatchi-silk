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

    const typeMap = {
      product: "products",
      category: "categories",
      setting: "settings",
      page: "pages",
      banner: "banners",
    };
    const mappedType = typeMap[type] || (type.endsWith("s") ? type : `${type}s`);

    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append("image", blob, req.file.originalname);
    formData.append("type", mappedType);
    formData.append("secret", cpanelUploadSecret);

    const uploadResponse = await fetch(cpanelUploadUrl, {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadResponse.json();

    if (!uploadData.success) {
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
