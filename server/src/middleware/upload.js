import multer from "multer";
import ApiError from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 12 * 1024 * 1024, // 15MB
  },

  fileFilter: (req, file, cb) => {
    const allowed = /^image\/(jpeg|jpg|png|webp)$/;

    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ApiError(
          400,
          "Only JPG, PNG or WebP images are allowed"
        )
      );
    }
  },
});

export default upload;