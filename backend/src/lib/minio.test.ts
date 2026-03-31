/**
 * MinIO integration test
 *
 * Diagnoses the upload failure by testing:
 *  1. MinIO is reachable at the configured endpoint
 *  2. The credentials in .env can authenticate
 *  3. The bucket exists and is accessible
 *  4. A real PutObject upload succeeds
 *
 * Run with: bun test src/lib/minio.test.ts
 */

import { describe, test, expect } from "bun:test";
import {
  S3Client,
  HeadBucketCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ---------------------------------------------------------------------------
// Read config directly so the test is self-contained and reports clearly
// ---------------------------------------------------------------------------

const ENDPOINT = process.env.MINIO_ENDPOINT ?? "http://127.0.0.1:9000";
const REGION = process.env.MINIO_REGION ?? "us-east-1";
const ACCESS_KEY = process.env.MINIO_ACCESS_KEY ?? "";
const SECRET_KEY = process.env.MINIO_SECRET_KEY ?? "";
const BUCKET = process.env.MINIO_BUCKET ?? "catalog-assets";

function makeClient(accessKeyId: string, secretAccessKey: string) {
  return new S3Client({
    endpoint: ENDPOINT,
    region: REGION,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("MinIO container reachability", () => {
  test("MinIO endpoint responds on HTTP", async () => {
    const res = await fetch(ENDPOINT).catch((e) => {
      throw new Error(`Cannot reach MinIO at ${ENDPOINT}: ${e.message}`);
    });
    // MinIO returns 403 on the root path for unauthenticated requests — that's
    // still proof the server is up.
    expect([200, 403]).toContain(res.status);
  });
});

describe("MinIO credentials from .env", () => {
  test("current MINIO_ACCESS_KEY is not a JWT token", () => {
    // A JWT has the form xxxxx.yyyyy.zzzzz — MinIO access keys must not look
    // like JWTs; they should be short alphanumeric strings like "minioadmin".
    const looksLikeJwt = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(
      ACCESS_KEY
    );
    expect(
      looksLikeJwt,
      `MINIO_ACCESS_KEY looks like a JWT token ("${ACCESS_KEY.slice(0, 40)}…"). ` +
        `It should be the MinIO root user (e.g. "minioadmin") from docker-compose.yml.`
    ).toBe(false);
  });

  test("can authenticate with .env credentials (HeadBucket)", async () => {
    const client = makeClient(ACCESS_KEY, SECRET_KEY);
    await client.send(new HeadBucketCommand({ Bucket: BUCKET }));
    // If the above throws, authentication or bucket access failed.
  });
});

describe("MinIO upload smoke test", () => {
  const client = makeClient(ACCESS_KEY, SECRET_KEY);
  const testKey = `_test/${crypto.randomUUID()}.txt`;

  test("PutObject succeeds", async () => {
    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: testKey,
        Body: "hello from catalog-app minio test",
        ContentType: "text/plain",
      })
    );
  });

  test("presigned PutObject URL is reachable and accepted", async () => {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: `_test/${crypto.randomUUID()}.txt`,
      ContentType: "text/plain",
    });
    const url = await getSignedUrl(client, command, { expiresIn: 60 });

    // The presigned URL host must be reachable from the browser (localhost /
    // 127.0.0.1, not an internal Docker hostname).
    const host = new URL(url).hostname;
    expect(
      ["localhost", "127.0.0.1"].includes(host),
      `Presigned URL uses host "${host}" which may not be reachable from the browser. ` +
        `MINIO_ENDPOINT should use localhost/127.0.0.1, not a Docker-internal hostname.`
    ).toBe(true);

    // Actually perform the upload via the presigned URL (simulates what the
    // browser does).
    const res = await fetch(url, {
      method: "PUT",
      body: "presigned upload test",
      headers: { "Content-Type": "text/plain" },
    });
    expect(
      res.ok,
      `Presigned PUT failed: ${res.status} ${await res.text()}`
    ).toBe(true);
  });

  test("cleanup: delete test objects", async () => {
    await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: testKey })).catch(() => {});
  });
});
