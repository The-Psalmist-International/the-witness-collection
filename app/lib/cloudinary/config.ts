export const CLOUDINARY_CLOUD_NAME = "dviigplcx";
export const CLOUDINARY_UPLOAD_PRESET = "domus-console";

export function getCloudinaryUploadUrl() {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
}
