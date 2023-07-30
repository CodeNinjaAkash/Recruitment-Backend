import Result from '../modals/result.js';
import Candidate from '../modals/candidate.js';
import transporter from '../config/emailconfig.js';

export const createResult = (req, res) => {
  const date = new Date();
  const testDate = {
    mm: date.getMonth(),
    dd: date.getDate(),
    yy: date.getFullYear().toString().slice(-2),
  };
  const {candidateId, questionAnswer} = req.body;
  if (candidateId && testDate && questionAnswer) {
    try {
      Candidate.findOne({_id: candidateId}).then((singleCandidate) => {
        let count = 0;
        singleCandidate?.candidateQuestion.forEach((element, index) => {
          let candidateAns = [];
          element.options.forEach((option, index) => {
            if (option.value) {
              candidateAns.push(element.options[index].title);
            }
          });
          if (JSON.stringify(candidateAns) === JSON.stringify(element.ans)) {
            count++;
          }
          candidateAns = [];
        });

        const resultPercentage =
         ((count * 100) / singleCandidate?.candidateQuestion.length).toFixed(2);

        const myCandidateId = {_id: candidateId};
        const myCandidateResult = {
          $set: {
            resultPercentage: resultPercentage,
          },
        };

        Candidate.updateOne(myCandidateId, myCandidateResult).then(() => {
          const doc = new Result({
            candidateId: candidateId,
            testDate: testDate,
            questionAnswer: questionAnswer,
          });
          const saveData = async (doc) => {
            await doc.save();
          };
          saveData(doc);
          if (process.env.EMAIL_FROM) {
            transporter.sendMail({
              from: process.env.EMAIL_FROM,
              to: process.env.EMAIL_FROM,
              subject: 'candidate exam submitted',
              html: `<h1>${singleCandidate.firstName} submitted the exam<h1/>`,
            });
          }
          res.status(201).send({
            status: 'success',
            message: 'Test submitted successfully',
          });
        });
      });
    } catch (error) {
      res.send({
        status: 'failed',
        message: 'Unable to Register',
        error: error,
      });
    }
  } else {
    res.send({status: 'failed', message: 'All fields are required'});
  }
};

