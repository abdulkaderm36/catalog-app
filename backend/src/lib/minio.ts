import { S3Client } from "@aws-sdk/client-s3";

import { env } from "@/config/env";

export const minioClient = new S3Client({
  endpoint: env.MINIO_ENDPOINT,
  region: env.MINIO_REGION,
  forcePathStyle: env.MINIO_FORCE_PATH_STYLE,
  credentials: {
    accessKeyId: env.MINIO_ACCESS_KEY,
    secretAccessKey: env.MINIO_SECRET_KEY,
  },
});
