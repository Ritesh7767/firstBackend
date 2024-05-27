import multer from 'multer'
import crypto from 'crypto'
import path from 'path'

const storage = multer.diskStorage({
    destination : (req, file, cb) => cb(null, './public/temp'),
    filename : (req, file, cb) => {
        crypto.randomBytes(12, (err, bytes) => {
            cb(null, bytes.toString('hex') + path.extname(file.originalname))
        })
    }
})

export const upload = multer({storage})