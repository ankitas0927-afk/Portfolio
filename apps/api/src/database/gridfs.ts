import mongoose from 'mongoose';

import { GRIDFS_BUCKETS } from '@ankita-portfolio/config';

type BucketName = (typeof GRIDFS_BUCKETS)[keyof typeof GRIDFS_BUCKETS];

const bucketCache = new Map<BucketName, mongoose.mongo.GridFSBucket>();

function getDb() {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('MongoDB connection is not ready');
  }
  return db;
}

export function getGridFsBucket(bucketName: BucketName) {
  const cached = bucketCache.get(bucketName);
  if (cached) {
    return cached;
  }

  const bucket = new mongoose.mongo.GridFSBucket(getDb(), { bucketName });
  bucketCache.set(bucketName, bucket);
  return bucket;
}

export async function deleteGridFsFile(
  bucketName: BucketName,
  fileId: mongoose.Types.ObjectId,
): Promise<void> {
  await getGridFsBucket(bucketName).delete(fileId);
}

export async function getGridFsFileDocument(
  bucketName: BucketName,
  fileId: mongoose.Types.ObjectId,
) {
  return getDb().collection(`${bucketName}.files`).findOne({ _id: fileId });
}
