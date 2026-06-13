// Multer config for avatar uploads — images only, 5MB max

const multer = require("multer");
const path = require("path");

// Save to uploads/avatars/ with unique filename
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.join(__dirname, "..", "uploads", "avatars"));
    },
    filename(req, file, cb) {
        const uniqueName = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

// Only allow image files
const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);

    if (extOk && mimeOk) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed (jpg, png, gif, webp)"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
