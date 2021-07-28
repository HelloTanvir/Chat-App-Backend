const uploader = require('../utils/multipleUploader');

function attachmentUpload(req, res, next) {
    const upload = uploader(
        ['image/jpeg', 'image/jpg', 'image/png'],
        1000000,
        2,
        'Only .jpg, jpeg or .png format allowed!'
    );

    // call the middleware function
    upload.any()(req, res, (err) => {
        if (err) {
            res.status(500).json({
                message: err.message,
            });
        } else {
            next();
        }
    });
}

module.exports = attachmentUpload;
