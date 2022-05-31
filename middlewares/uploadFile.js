const multer = require("multer");

//destination & rename

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "upload")
    },
    filename:function (req, file, cb){
        cb(null, Date.now() + '-' + file.originalname)
    },
});

const upload = multer({ storage });

module.exports = upload;