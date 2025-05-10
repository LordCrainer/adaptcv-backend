import AWS, { S3Client } from '@aws-sdk/client-s3'

import config from '@src/config/environments'

const { storage } = config

class S3ClientSingleton {
  private static instance: S3Client

  private constructor() {}

  public static getInstance(): S3Client {
    if (!S3ClientSingleton.instance) {
      S3ClientSingleton.instance = new S3Client({
        endpoint: storage.doSpace.bucketEndpoint,
        region: storage.doSpace.region,
        forcePathStyle: false,
        credentials: {
          accessKeyId: storage.doSpace.keyId,
          secretAccessKey: storage.doSpace.secret
        }
      })
    }
    return S3ClientSingleton.instance
  }
}

export default S3ClientSingleton
