import Candidate from '../modals/candidate.js';
import path from 'path';
import {fileURLToPath} from 'url';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const createReJoinLink = async (req, res) => {
  try {
    const {id} = req.query;
    if (!id) {
      return res.send({status: 'failed', message: 'id is required or invalid'});
    }

    const user = await Candidate.findOne({_id: id});
    if (!user) {
      return res.send({status: 'failed', message: 'User doesn\'t exist'});
    }

    const secret = process.env.JWT_SECRET_KEY;
    const refreshToken = user.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({message: 'Refresh token not found'});
    }

    try {
      const decoded = jwt.verify(refreshToken, secret);
      const token = jwt.sign({userID: decoded._id}, secret, {expiresIn: '15m'});
      const link = `${process.env.CANDIDATE_APP_BASE_PATH}/candidate/rejoin/${user._id}/${token}`;

      const myQuery = {_id: id};
      const newValues = {
        $set: {
          link: link,
          joinToken: '',
        },
      };

      await Candidate.updateOne(myQuery, newValues);

      res.status(201).send({
        status: 'success',
        link: link,
        token: user.token,
        currentPath: user.currentPath,
        message: 'rejoin link successfully created',
      });
    } catch (err) {
      return res.status(403).json({message: 'Invalid refresh token'});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Internal server error'});
  }
};

export const verifyReJoinLink = async (req, res) => {
  try {
    const {id, token} = req.params;
    const user = await Candidate.findById(id);

    if (user.joinToken !== token) {
      const myQuery = {_id: id};
      const newValues = {$set: {joinToken: token}};
      await Candidate.updateOne(myQuery, newValues);

      try {
        const secret = process.env.JWT_SECRET_KEY;
        const decoded = jwt.verify(token, secret);
        const newToken = jwt.sign({userID: decoded._id}, secret, {expiresIn: '3h'});

        res.status(200).send({
          status: 'success',
          token: newToken,
          quizTimer: user.quizTimer,
          currentPath: user.currentPath,
          currentQuestionNumber: user.currentQuestionNumber,
          message: 'rejoin link is authenticated successfully',
        });
      } catch (err) {
        return res.status(403).json({status: 'failed', message: 'Invalid refresh token'});
      }
    } else {
      res.status(400).send({
        status: 'failed',
        message: 'Cannot join again with the same link',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({message: 'Internal server error'});
  }
};

export const updateQuizTime = async (req, res) => {
  try {
    const {id, quizTimer} = req.body;
    const myQuery = {_id: id};
    const newValues = {
      $set: {
        quizTimer: quizTimer,
      },
    };
    await Candidate.updateOne(myQuery, newValues);
    res.status(200).send({status: 'success', message: 'Time updated'});
  } catch (error) {
    res.status(500).send({status: 'failed', message: error.message});
  }
};

export const updateCurrentPath = async (req, res) => {
  try {
    const {id, currentPath} = req.query;
    const myQuery = {_id: id};
    const newValues = {
      $set: {
        currentPath: currentPath,
      },
    };
    await Candidate.updateOne(myQuery, newValues);
    res
        .status(200)
        .send({status: 'success', message: 'current path updated!'});
  } catch (error) {
    res.status(500).send({status: 'failed', message: error.message});
  }
};

export const downloadResume = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Candidate.findById(id);

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const _foldername = path.join(__dirname, '..');

    // The folder path for the files
    const folderPath = _foldername + '/public/uploads/rdoc';

    if (data.rdoc) {
      res.download(folderPath + `/${data.rdoc}`, (err) => {
        if (err) {
          res.send(err);
        }
      });
    } else {
      res.status(404).send({message: 'file doesn\'t exist'});
    }
  } catch (error) {
    res.status(500).send({status: 'failed', message: error.message});
  }
};
