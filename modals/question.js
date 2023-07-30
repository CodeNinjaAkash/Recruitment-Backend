import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  question: String,
  currentTime: String,
  registerDate: String,
  options: [
    {
      title: {
        type: String,
        required: false,
      },
      value: {
        type: Boolean,
        required: false,
        default: false,
      },
      query: {type: String, required: false},
    },
  ],
  optionType: {
    type: String,
    enum: ['Single', 'Multiple', 'Query'],
    default: 'Single',
  },
  ans: Array,
});

const Question = mongoose.model('question', QuestionSchema);

export default Question;
