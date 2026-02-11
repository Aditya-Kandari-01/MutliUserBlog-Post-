// Handles file uploads from forms.
const multer = require('multer')

// Connects multer --> Cloudinary storage (so files go to cloud, not disk)
const {CloudinaryStorage} = require('multer-storage-cloudinary') 

// file inside config
const cloudinary = require('./cloudinary')


const storage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder:'profile-pics',
        allowed_formats:['jpg', 'png', 'jpeg', 'webp'],
        public_id: (req,file) =>{
            return req.user.userId + '-' + Date.now();
        }
    }
})
const upload = multer({

  storage,

  fileFilter: (req, file, cb) => {

    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // accept
    } else {
      cb(new Error('Only images allowed'), false); // reject
    }

  },

  limits: {
    fileSize: 16 * 1024 * 1024 // 5MB max
  }

});


module.exports = upload