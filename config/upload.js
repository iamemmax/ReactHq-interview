const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/upload");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

// require("../assets/upload")
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("File types allowed .jpeg, .jpg and .png!"));
    }
    // if(file.length >= 6){
    //     cb(null, false);
    //     return cb(new Error('only 6 images allow'));
    // }
  },
});

module.exports = upload;
