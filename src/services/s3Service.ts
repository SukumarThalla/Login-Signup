import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
dotenv.config();
const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: String(process.env.AWS_ACCESSKEY_ID),
    secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY),
  },
});

export const getPresignedUrl = async (filename: string, type: string) => {
  const params = {
    Bucket: String(process.env.AWS_BUCKET_NAME),
    Key: `uploads/${filename}`,
    contentType: type,
  };
  const command = new PutObjectCommand(params);
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  return { signedUrl, filePath: params.Key };
};
