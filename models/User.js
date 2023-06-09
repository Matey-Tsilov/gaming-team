const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'The username is mandatory!'],
        minLength: [5, 'The username should be at least five characters long.']
    },
    email: {
        type: String,
        required: [true, 'The email is mandatory!'],
        unique: [true, 'This email is already taken!'],
        minLength: [10, 'The email should be at least ten character long.']
    },
    password: {
        type: String,
        required: [true, 'The password is mandatory!'],
        minLength: [4, 'The password should be at least four character long.']
    }
})

userSchema.pre('save', async function (next) {
    const saltRounds = 10
    const hashedPass = await bcrypt.hash(this.password, saltRounds)
    this.password = hashedPass
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User