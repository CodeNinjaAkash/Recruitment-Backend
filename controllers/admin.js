import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import transporter from '../config/emailconfig.js';
import Admin from '../modals/admin.js';
import dotenv from 'dotenv';
dotenv.config();

export const adminLogin = async (req, res) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      return res.status(400).send({status: 'failed', message: 'All Fields are Required'});
    }

    const user = await Admin.findOne({email});
    if (user) {
      const isMatch =await bcrypt.compare(password, user.password);
      if (user.email === email && isMatch) {
        const token = jwt.sign(
            {userID: user._id},
            process.env.JWT_SECRET_KEY,
            {expiresIn: '1d'},
        );
        return res.status(200).send({
          status: 'success',
          message: 'Login Success',
          token: token,
          email: email,
        });
      } else {
        return res.status(401).send({
          status: 'failed',
          message: 'Email or Password is not Valid',
        });
      }
    } else {
      return res.status(500).send({
        status: 'failed',
        message: 'You are not a Registered User',
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: 'failed',
      message: `Unable to Login: ${error.message}`,
    });
  }
};

export const changeAdminPassword = async (req, res) => {
  try {
    const {password, passwordConfirmation} = req.body;
    const {authorization} = req.headers;
    const token = authorization.split(' ')[1];
    const {userID} = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!password || !passwordConfirmation) {
      return res.status(400).send({status: 'failed', message: 'All Fields are Required'});
    }

    if (password !== passwordConfirmation) {
      return res.status(400).send({
        status: 'failed',
        message: 'New Password and Confirm New Password don\'t match',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHashPassword = await bcrypt.hash(password, salt);

    await Admin.findByIdAndUpdate(userID, {
      $set: {password: newHashPassword},
    });

    res.status(200).send({status: 'success', message: 'Password changed successfully'});
  } catch (error) {
    res
        .status(500)
        .send({status: 'failed', message: 'Internal server error', error});
  }
};

export const sendAdminPasswordResetEmail = async (req, res) => {
  try {
    const {email} = req.body;

    if (!email) {
      return res
          .status(400)
          .send({status: 'failed', message: 'Email Field is Required'});
    }

    const admin = await Admin.findOne({email});

    if (!admin) {
      return res
          .status(404)
          .send({status: 'failed', message: 'Email doesn\'t exist'});
    }

    const secret = admin._id + process.env.JWT_SECRET_KEY;
    const token = jwt.sign({userID: admin._id}, secret, {expiresIn: '15m'});

    const link =
    `${process.env.ADMIN_APP_BASE_PATH}/management/reset-password/${admin._id}/${token}`;

    if (!process.env.EMAIL_FROM) return;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: admin.email,
        subject: 'Password Reset Link',
        html: `<a href=${link}>Click Here</a> to Reset Your Password`,
      });

      res.status(200).send({
        status: 'success',
        message: 'Password Reset Email Sent... Please Check Your Email',
      });
    } catch (error) {
      res
          .status(500)
          .send({status: 'failed', message: 'Failed to send email', error});
    }
  } catch (error) {
    res
        .status(500)
        .send({status: 'failed', message: 'Internal server error', error});
  }
};

export const AdminPasswordReset = async (req, res) => {
  try {
    const {password, passwordConfirmation} = req.body;
    const {id, token} = req.params;

    const admin = await Admin.findById(id);
    const newSecret = admin._id + process.env.JWT_SECRET_KEY;

    try {
      jwt.verify(token, newSecret);

      if (!password || !passwordConfirmation) {
        return res
            .status(400)
            .send({status: 'failed', message: 'All Fields are Required'});
      }

      if (password !== passwordConfirmation) {
        return res.status(400).send({
          status: 'failed',
          message: 'New Password and Confirm New Password don\'t match',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(password, salt);

      await Admin.findByIdAndUpdate(admin._id, {password: newHashPassword});

      return res
          .status(200)
          .send({status: 'success', message: 'Password Reset Successfully'});
    } catch (error) {
      return res
          .status(400)
          .send({status: 'failed', message: 'Invalid Token', error: error});
    }
  } catch (error) {
    return res.status(500).send({
      status: 'failed',
      message: 'Internal server error',
      error: error,
    });
  }
};
