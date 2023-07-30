import mongoose from 'mongoose';

const candidateResultSchema = new mongoose.Schema({
  candidateId: {type: Object},
  testDate: {type: Object},
  questionAnswer: [
    {
      questionId: {type: Object},
      ans: Array,
    },
  ],
});

const Result = mongoose.model('result', candidateResultSchema);

export default Result;
