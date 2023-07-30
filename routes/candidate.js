import express from 'express';
const userRoutes = new express.Router();
import {authRoutes} from './admin.js';
import upload from '../middleware/upload-middleware.js';
import {checkCandidateAuth} from '../middleware/auth-middleware.js';
import trimSpaces from '../middleware/trim-middleware.js';
import {updateQuizTime} from '../controllers/features.js';
import {verifyReJoinLink} from '../controllers/features.js';
import {updateCurrentPath} from '../controllers/features.js';
import {
  createCandidate,
  updateCandidate,
} from '../controllers/candidate.js';
import {testQuestions, updateAns} from '../controllers/question.js';
import {colleges} from '../controllers/college.js';
import {
  createResult,
} from '../controllers/result.js';
// userRoutes.use(
//     '/create-candidate',
//     upload.fields([{name: 'rdoc', maxCount: 1}]),
// );

authRoutes.post('/rejoin-by-link/:id/:token', verifyReJoinLink);

authRoutes.post(
    '/create-candidate',
    trimSpaces,
    upload.none(),
    createCandidate,
);

userRoutes.put(
    '/update-candidate/:id',
    checkCandidateAuth,
    trimSpaces,
    updateCandidate,
);

userRoutes.get('/test-questions/:id', checkCandidateAuth, testQuestions);

userRoutes.put('/update-ans/:id', checkCandidateAuth, trimSpaces, updateAns);

userRoutes.get('/colleges', colleges);

userRoutes.put('/update-currentPath', checkCandidateAuth, updateCurrentPath);

userRoutes.post('/update-time', checkCandidateAuth, updateQuizTime);

userRoutes.post('/submit-test', checkCandidateAuth, createResult);


export default userRoutes;
