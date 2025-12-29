import { S3Client } from '@aws-sdk/client-s3'
import env from '../config'

export const s3 = new S3Client({
    region: env.S3_REGION,
    credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: !!env.S3_ENDPOINT, // Needed for some S3 compatible providers like MinIO
})
