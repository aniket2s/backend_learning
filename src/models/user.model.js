import mongoose, {Schema} from "mongoose";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true //we use index : true so that we can enable searching
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true //we use index : true so that we can enable searching
        },
        avatar: {
            type: String,
            required: true
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

// should not use arrow function below because we need context here and arrow func doesn't know the context
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next(); // we are doing this to check if password is modified then only we will encrypt the password again.
    
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// we are adding a method here in schema from our side
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password) // it will return either true or false
}

// we are adding two methods here 
userSchema.methods.generateAccessToken = function(){
    return jsonwebtoken.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jsonwebtoken.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)