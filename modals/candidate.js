import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema({
  firstName: {type: String, required: true},
  middleName: {type: String, required: true},
  lastName: {type: String, required: true},
  email: {type: String, required: true},
  dob: {type: String, required: true},
  mobileNo: {type: String, required: true},
  educationDetails: {type: String},
  areaOfInterest: {type: String},
  futureGoal: {type: String},
  currentAddress: {type: String, required: true},
  experience: {
    type: String,
    enum: ['null', 'Trainee', '1-2', '3-4', '5-6', '7-8', '9-10', '10+'],
    default: 'null',
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
  },
  rdoc: {type: Object},
  registerDate: {type: Date, required: true},
  candidateQuestion: {type: Object},
  currentTime: {type: String},
  resultPercentage: {type: String},
  step: {type: String},
  token: {type: String},
  refreshToken: {type: String},
  joinToken: {type: String},
  currentPath: {type: String},
  currentQuestionNumber: {type: Number},
  link: {type: String},
  quizTimer: {type: Object},
});

const Candidate = mongoose.model('candidate', CandidateSchema);

export default Candidate;
