import jwt from 'jsonwebtoken';
import Admin from '../modals/admin.js';
import Candidate from '../modals/candidate.js';

export const checkAdminAuth = (req, res, next) => {
  let token;
  const {authorization} = req.headers;
  if (authorization && authorization.startsWith('Bearer')) {
    try {
      // Get Token from header
      token = authorization.split(' ')[1];
      // Verify Token
      const {userID} = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const _id = userID;
      // Get User from Token

      req.user = Admin.findById(_id).select('-password');
      next();
    } catch (error) {
      res
          .status(401)
          .send({status: 'failed', message: 'Unauthorized User', error: error});
    }
  }
  if (!token) {
    res
        .status(401)
        .send({status: 'failed', message: 'Unauthorized User, No Token'});
  }
};

export const checkCandidateAuth = (req, res, next) => {
  let token;
  const {authorization} = req.headers;
  if (authorization && authorization.startsWith('Bearer')) {
    try {
      // Get Token from header
      token = authorization.split(' ')[1];
      // Verify Token
      const {userID} = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const _id = userID;
      // Get User from Token
      req.user = Candidate.findById(_id).select('-password');
      next();
    } catch (error) {
      res.status(401).send({status: 'failed', message: 'Unauthorized User', error: error});
    }
  }
  if (!token) {
    res
        .status(401)
        .send({status: 'failed', message: 'Unauthorized User, No Token'});
  }
};
