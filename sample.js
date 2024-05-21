import bcrypt from 'bcrypt'

bcrypt.hash("ritesh", 15, (err, hash) => {
    console.log(hash)
})