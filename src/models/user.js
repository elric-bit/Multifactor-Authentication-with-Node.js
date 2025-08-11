import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 10
    },
    isMfaEnabled: {
        type: Boolean,
        required: true,
        default: false
    },
    twoFactorSecret: {
        type: String,
        required: false,
    },
});

const User = mongoose.model('User', UserSchema);
export default User;
