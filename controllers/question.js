import Question from '../modals/question.js';
import Candidate from '../modals/candidate.js';

export const question = async (req, res) => {
  try {
    const id = req.params.id;
    const question = await Question.findById({_id: id});
    if (question) {
      return res
          .status(200)
          .send({
            status: 'success',
            message: 'question retrieved successfully',
            question,
          });
    }
    return res.status(404).send({
      status: 'failed',
      message: 'Question not found',
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};
export const testQuestions = async (req, res) => {
  try {
    const id = req.params.id;
    const candidate = await Candidate.findById(id).select(
        'candidateQuestion._id candidateQuestion.question candidateQuestion.options candidateQuestion.optionType',
    );
    if (candidate) {
      return res.status(200).send({
        status: 'success',
        message: 'Question retrieved successfully',
        candidate,
      });
    }
    return res.status(404).send({
      status: 'failed',
      message: 'Question not found',
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const createQuestion = async (req, res) => {
  const {question, options, optionType, ans} = req.body;

  if (question && options && optionType && ans) {
    try {
      const date = new Date().toUTCString();
      const doc = new Question({
        question,
        options,
        optionType,
        ans,
        registerDate: date,
      });

      await doc.save();
      return res.status(201).send({
        status: 'success',
        message: 'Question successfully added!',
      });
    } catch (error) {
      return res.status(500).send({
        status: 'failed',
        message: 'Unable to add question',
        error: error.message,
      });
    }
  } else {
    return res.status(400).send({
      status: 'failed',
      message: 'All fields are required',
    });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const {question, options, optionType, ans} = req.body;
    const _id = req.params.id;

    if (!question || !options || !optionType || !ans) {
      return res
          .status(400)
          .send({status: 'error', message: 'All fields are required'});
    }

    const myQuery = {_id: _id};
    const newValues = {
      $set: {
        question: question,
        options: options,
        optionType: optionType,
        ans: ans,
      },
    };
    await Question.updateOne(myQuery, newValues);
    res.status(200).send({message: 'Question successfully updated!'});
  } catch (err) {
    res.status(500).send({status: 'error', message: err.message});
  }
};

export const updateAns = async (req, res) => {
  const {candidateQuestion, selectedQueIndex, currentQuestionNumber} =
    req.body;
  const {quiztimer} = req.headers;
  const _id = req.params.id;
  try {
    const querySearch = `candidateQuestion.${selectedQueIndex}.options`;
    await Candidate.findOneAndUpdate(
        {$and: [{_id: _id}]},
        {
          $set: {
            [querySearch]: candidateQuestion.options,
            quizTimer: JSON.parse(quiztimer),
            currentQuestionNumber: currentQuestionNumber,
          },
        },
    ).clone();
    return res.send({status: 'success', message: 'Answer saved'});
  } catch (error) {
    return res.send({
      status: 'failed',
      message: 'failed to update ans',
      error: error.message,
    });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const _id = req.params.id;
    const question = await Question.findOne({_id});
    if (!question) {
      return res.status(404).send({
        status: 'failed',
        message: 'Question not found',
      });
    }
    await Question.deleteOne({_id});
    return res.status(200).send({
      status: 'success',
      message: 'Question deleted successfully',
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'Failed to delete the question',
      error: error.message,
    });
  }
};
