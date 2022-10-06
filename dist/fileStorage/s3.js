"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createS3FileStorage = void 0;
//upload local pdf file to s3 bucket
const aws_sdk_1 = require("aws-sdk");
const fs_1 = require("fs");
const filePathBuilder_1 = require("../utils/filePathBuilder");
const createS3FileStorage = () => {
    const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME, AWS_REGION, } = process.env;
    const s3 = new aws_sdk_1.S3({
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
        region: AWS_REGION,
    });
    const uploadFile = (document) => __awaiter(void 0, void 0, void 0, function* () {
        const filePath = (0, filePathBuilder_1.buildTempFileName)(document);
        const fileStream = (0, fs_1.createReadStream)(filePath);
        const uploadParams = {
            Bucket: AWS_BUCKET_NAME !== null && AWS_BUCKET_NAME !== void 0 ? AWS_BUCKET_NAME : "",
            Body: fileStream,
            Key: (0, filePathBuilder_1.buildRemoteFileName)(document),
        };
        return yield s3
            .upload(uploadParams)
            .promise()
            .then((data) => {
            console.log("File uploaded successfully: ", data.Location);
            return data.Location;
        })
            .catch((err) => {
            console.log("Error", err);
        });
    });
    return { uploadFile };
};
exports.createS3FileStorage = createS3FileStorage;
