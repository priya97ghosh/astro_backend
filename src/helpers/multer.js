const util = require("util");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
// const dbConfig = require("../config/db");
require('dotenv').config();

const storage = new GridFsStorage({
    url: process.env.MONGO_ATLAS_DATABASE,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        const match = ["image/png", "image/jpeg"];

        if (match.indexOf(file.mimetype) === -1) {
            const filename = `${Date.now()}-banner-${file.originalname}`;
            return filename;
        }

        return {
            bucketName: "banners",
            filename: `${Date.now()}-banner-${file.originalname}`
        };
    }
});

const uploadFiles = multer({ storage: storage }).array("file", 10);
// const uploadFiles = multer({ storage: storage }).single("file");
const uploadFilesMiddleware = util.promisify(uploadFiles);
module.exports = uploadFilesMiddleware;
