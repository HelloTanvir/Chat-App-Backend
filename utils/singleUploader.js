const createHttpError = require('http-errors');
const multer = require('multer');
const path = require('path');

const uploader = (allowedFileTypes, maxFileSize, errorMsg) => {
    // define the storage
    const storage = multer.diskStorage({
        filename: (req, file, cb) => {
            const fileExt = path.extname(file.originalname);
            const fileName = `${file.originalname
                .replace(fileExt, '')
                .toLowerCase()
                .split(' ')
                .join('-')}-${Date.now()}`;

            cb(null, fileName + fileExt);
        },
    });

    // preapre the final multer upload object
    const upload = multer({
        storage,
        limits: {
            fileSize: maxFileSize,
        },
        fileFilter: (req, file, cb) => {
            if (allowedFileTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(createHttpError(400, errorMsg), false);
            }
        },
    });

    return upload;
};

module.exports = uploader;
