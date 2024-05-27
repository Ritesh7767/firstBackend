import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({ 
  cloud_name: 'duvoga9f5', 
  api_key: '235896485895776', 
  api_secret: 'CDpvfkgYBQSlV3t2IN2HnepzGEU' 
});

const uploadFile = async (localFile) => {
    try{
        if(!localFile) return null;
        let result = await cloudinary.uploader.upload(localFile, {
            resource_type : 'auto'
        })
        fs.unlinkSync(localFile)
        return result;
    }
    catch(err){
        fs.unlinkSync(localFile)
    }
}

export default uploadFile