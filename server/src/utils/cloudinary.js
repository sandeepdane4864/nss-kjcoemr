import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export const uploadBuffer = (
  buffer,
  folder = "misc"
) =>
  new Promise((resolve, reject) => {

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `nss/${folder}`,
        resource_type: "image",
      },

      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    stream.end(buffer);
  });


export const destroyImage = (publicId) => {
  if (!publicId) return null;

  return cloudinary.uploader.destroy(publicId);
};