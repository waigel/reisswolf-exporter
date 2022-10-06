//upload local pdf file to s3 bucket
import { S3 } from "aws-sdk";
import { PutObjectRequest } from "aws-sdk/clients/s3";
import { createReadStream } from "fs";
import { ReisswolfDocument } from "../types/Document";
import {
  buildRemoteFileName,
  buildTempFileName,
} from "../utils/filePathBuilder";
import { FileStorage } from "./FileStorage";

export const createS3FileStorage = (): FileStorage => {
  const {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_BUCKET_NAME,
    AWS_REGION,
  } = process.env;

  const s3 = new S3({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION,
  });

  const uploadFile = async (document: ReisswolfDocument) => {
    const filePath = buildTempFileName(document);
    const fileStream = createReadStream(filePath);
    const uploadParams: PutObjectRequest = {
      Bucket: AWS_BUCKET_NAME ?? "",
      Body: fileStream,
      Key: buildRemoteFileName(document),
    };

    return await s3
      .upload(uploadParams)
      .promise()
      .then((data) => {
        console.log("File uploaded successfully: ", data.Location);
        return data.Location;
      })
      .catch((err) => {
        console.log("Error", err);
      });
  };
  return { uploadFile };
};
