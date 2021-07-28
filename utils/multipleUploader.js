// external imports
const multer = require('multer');
const path = require('path');
const createHttpError = require('http-errors');

function uploader(allowedFileTypes, maxFileSize, maxNumberOfFiles, errorMsg) {
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
            if (req.files.length > maxNumberOfFiles) {
                cb(createHttpError(`Maximum ${maxNumberOfFiles} files are allowed to upload!`));
            } else if (allowedFileTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(createHttpError(errorMsg));
            }
        },
    });

    return upload;
}

module.exports = uploader;
