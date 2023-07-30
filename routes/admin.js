import express from 'express';
const managementRoutes = new express.Router();
export const authRoutes = new express.Router();

import Question from '../modals/question.js';
import College from '../modals/college.js';
import paginate from '../middleware/pagination-middleware.js';
import SameOptions from '../middleware/options-middleware.js';
import {checkAdminAuth} from '../middleware/auth-middleware.js';
import upload from '../middleware/upload-middleware.js';
import trimSpaces from '../middleware/trim-middleware.js';
import {createReJoinLink} from '../controllers/features.js';
import {downloadResume} from '../controllers/features.js';
import {
  adminLogin,
  sendAdminPasswordResetEmail,
  AdminPasswordReset,
  changeAdminPassword,
} from '../controllers/admin.js';
import {
  candidate,
  createCandidate,
  updateCandidateByAdmin,
  filterCandidate,
  deleteCandidate,
} from '../controllers/candidate.js';
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  question,
} from '../controllers/question.js';
import {
  colleges,
  college,
  createCollege,
  deleteCollege,
  updateCollege,
} from '../controllers/college.js';

authRoutes.post('/login', trimSpaces, adminLogin);

authRoutes.post(
    '/change-password',
    checkAdminAuth,
    trimSpaces,
    changeAdminPassword,
);

authRoutes.post(
    '/send-reset-password-email',
    trimSpaces,
    sendAdminPasswordResetEmail,
);

authRoutes.post(
    '/reset-password/:id/:token',
    trimSpaces,
    AdminPasswordReset,
);

managementRoutes.get(
    '/filter-candidate-details',
    checkAdminAuth,
    filterCandidate,
);

managementRoutes.get('/candidate-details/:id', checkAdminAuth, candidate);

managementRoutes.post(
    '/create-candidate',
    trimSpaces,
    upload.none(),
    createCandidate,
);

managementRoutes.put(
    '/update-candidate/:id',
    trimSpaces,
    checkAdminAuth,
    updateCandidateByAdmin,
);

managementRoutes.delete(
    '/delete-candidate/:id',
    checkAdminAuth,
    deleteCandidate,
);

managementRoutes.get('/paginate-questions', checkAdminAuth, paginate(Question));

managementRoutes.get('/question/:id', checkAdminAuth, question);

managementRoutes.post(
    '/create-question',
    checkAdminAuth,
    SameOptions,
    createQuestion,
);

managementRoutes.put(
    '/update-question/:id',
    checkAdminAuth,
    trimSpaces,
    SameOptions,
    updateQuestion,
);
managementRoutes.delete('/delete-question/:id', checkAdminAuth, deleteQuestion);

managementRoutes.get('/colleges', colleges);

managementRoutes.get('/paginate-colleges', checkAdminAuth, paginate(College));

managementRoutes.get('/college/:id', checkAdminAuth, college);

managementRoutes.post(
    '/create-college',
    checkAdminAuth,
    trimSpaces,
    createCollege,
);

managementRoutes.put(
    '/update-college/:id',
    checkAdminAuth,
    trimSpaces,
    updateCollege,
);

managementRoutes.delete('/delete-college/:id', checkAdminAuth, deleteCollege);

managementRoutes.put('/create-rejoin-link', checkAdminAuth, createReJoinLink);

managementRoutes.get('/resume-download/:id', checkAdminAuth, downloadResume);


export default managementRoutes;
