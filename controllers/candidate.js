import dotenv from 'dotenv';
dotenv.config();
import Candidate from '../modals/candidate.js';
import College from '../modals/college.js';
import Question from '../modals/question.js';
import transporter from '../config/emailconfig.js';
import jwt from 'jsonwebtoken';

export const candidate = (req, res) => {
  const {id} = req.params;
  Candidate.findById({_id: id})
      .then((candidate) => {
        if (candidate) {
          res.status(200).send({
            status: 'success',
            message: 'candidate details retrieved',
            candidate,
          });
        } else {
          res.status(404).send({
            status: 'failed',
            message: 'Candidate not found',
          });
        }
      })
      .catch((error) => {
        res.status(500).send({
          status: 'failed',
          message: error.message,
        });
      });
};

export const filterCandidate = async (req, res) => {
  try {
    const queryData = {};
    const registerDate = {};
    const result = {};

    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const collegeId = req.query.collegeId;
    const firstName = req.query.firstName;
    const email = req.query.email;
    const mobileNo = req.query.mobileNo;

    if (startDate) {
      registerDate.$gte = new Date(startDate).toISOString();
    }
    if (endDate) {
      registerDate.$lte = new Date(endDate + 'T23:59:59.000Z');
    }
    if (collegeId) {
      queryData.college = collegeId;
    }
    if (firstName) {
      queryData.firstName = {$regex: `^${firstName}`, $options: 'i'};
    }
    if (email) {
      queryData.email = {$regex: `^${email}`, $options: 'i'};
    }
    if (mobileNo) {
      queryData.mobileNo = {$regex: mobileNo};
    }
    if (startDate !== undefined || endDate !== undefined) {
      queryData.registerDate = registerDate;
    }

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const countQuery = Candidate.countDocuments(queryData).exec();
    const candidatesQuery = Candidate.find(queryData)
        .sort({_id: -1})
        .limit(limit)
        .skip(startIndex)
        .populate('college')
        .lean()
        .exec();

    const [count, candidates] = await Promise.all([
      countQuery,
      candidatesQuery,
    ]);

    result.results = candidates;
    result.dataSize = count;
    result.message = 'success';

    if (startIndex > 0) {
      result.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    if (startIndex + limit < count) {
      result.next = {
        page: page + 1,
        limit: limit,
      };
    }

    res.status(200).json({
      results: result.results,
      dataSize: result.dataSize,
      message: result.message,
      previous: result.previous,
      next: result.next,
    });
  } catch (error) {
    res.status(500).json({
      status: 'failed',
      message: 'Request failed with status code 500',
      error: error,
    });
  }
};

export const createCandidate = async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    email,
    dob,
    mobileNo,
    educationDetails,
    areaOfInterest,
    futureGoal,
    currentAddress,
    collegeId,
    experience,
  } = req.body;

  const regex = /^[A-Za-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

  if (!regex.test(email)) {
    return res
        .status(400)
        .send({status: 'failed', message: 'Please enter a valid email'});
  }

  try {
    const user = await Candidate.findOne({email});
    if (user) {
      return res
          .status(409)
          .send({status: 'failed', message: 'Email already exists'});
    }

    const registerDate = new Date().toUTCString();
    const currentTime = new Date().toLocaleTimeString('en-GB');

    const saveData = async () => {
      const candidateQuestion = await Question.aggregate([
        {$sample: {size: 30}},
      ]);
      const collegeData = await College.findOne({_id: collegeId});
      if (
        (experience === 'Trainee' || experience === '1-2') &&
        firstName &&
        middleName &&
        lastName &&
        email &&
        dob &&
        mobileNo &&
        educationDetails &&
        areaOfInterest &&
        futureGoal &&
        currentAddress &&
        experience &&
        collegeData?._id &&
        candidateQuestion &&
        currentTime
      ) {
        const doc = new Candidate({
          firstName: firstName,
          middleName: middleName,
          lastName: lastName,
          email: email,
          dob: dob,
          mobileNo: mobileNo,
          educationDetails: educationDetails,
          areaOfInterest: areaOfInterest,
          futureGoal: futureGoal,
          currentAddress: currentAddress,
          experience: experience,
          college: collegeData._id,
          registerDate: registerDate,
          candidateQuestion: candidateQuestion,
          currentTime: currentTime,
          step: 'start test',
          currentPath: '/start_test',
        });
        await doc.save().then(async () => {
          await Candidate.findOne({email}).then((candidateData) => {
            const sendMail = async () => {
              if (process.env.EMAIL_FROM) {
                await transporter.sendMail({
                  from: process.env.EMAIL_FROM,
                  to: process.env.EMAIL_FROM,
                  subject: 'New candidate registered',
                  html: `<h1>New candidate ${candidateData.firstName} registered<h1/>`,
                });
              }
            };
            sendMail();
            const token = jwt.sign(
                {userID: candidateData._id},
                process.env.JWT_SECRET_KEY,
                {expiresIn: '3h'},
            );
            const refreshToken = jwt.sign(
                {userID: candidateData._id},
                process.env.JWT_SECRET_KEY,
                {expiresIn: '356d'},
            );
            doc.quizTimer={hours: 0, minutes: 59, seconds: 59};
            doc.token = token;
            doc.refreshToken = refreshToken;
            const addRefreshToken = async () => {
              await doc.save();
            };
            addRefreshToken();
            return res.status(201).send({
              status: 'success',
              message: 'You are successfully registered.',
              candidateid: candidateData._id,
              token: token,
            });
          });
        });
      } else {
        if (
          firstName &&
          middleName &&
          lastName &&
          email &&
          dob &&
          mobileNo &&
          currentAddress &&
          experience &&
          registerDate &&
          currentTime &&
          candidateQuestion
        ) {
          const doc = new Candidate({
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            email: email,
            dob: dob,
            mobileNo: mobileNo,
            currentAddress: currentAddress,
            experience: experience,
            registerDate: registerDate,
            currentTime: currentTime,
            candidateQuestion: candidateQuestion,
            step: 'start test',
            currentPath: '/start_test',
          });
          await doc.save().then(async () => {
            await Candidate.findOne({email}).then((candidateData) => {
              const sendMail = async () => {
                if (process.env.EMAIL_FROM) {
                  await transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: process.env.EMAIL_FROM,
                    subject: 'New candidate registered',
                    html: `<h1>New candidate ${candidateData.firstName} registered<h1/>`,
                  });
                }
              };
              sendMail();
              const token = jwt.sign(
                  {userID: candidateData._id},
                  process.env.JWT_SECRET_KEY,
                  {expiresIn: '3h'},
              );
              const refreshToken = jwt.sign(
                  {userID: candidateData._id},
                  process.env.JWT_SECRET_KEY,
                  {expiresIn: '365d'},
              );
              doc.quizTimer={hours: 0, minutes: 59, seconds: 59};
              doc.token = token;
              doc.refreshToken = refreshToken;
              const addRefreshToken = async () => {
                await doc.save();
              };
              addRefreshToken();
              res.status(201).send({
                status: 'success',
                message: 'You are successfully registered.',
                candidateid: candidateData._id,
                token: token,
              });
            });
          });
        } else {
          res.status(400).send({status: 'failed', message: 'All fields are required.'});
        }
      }
    };
    saveData();
  } catch (error) {
    res.send({
      status: 'failed',
      message: 'Please enter a valid email',
      error: error,
    });
  }
};

export const updateCandidate = async (req, res) => {
  try {
    const {
      candidateQuestion,
      step,
    } = req.body;
    const _id = req.params.id;
    const candidate = await Candidate.findOne({_id});
    if (!candidate) {
      return res.status(404).send({
        status: 'failed',
        message: `Candidate doesn\'t exist with this Id`,
      });
    }
    candidateQuestion ?
      (candidate.candidateQuestion = candidateQuestion) :
      null;
    step ? (candidate.step = step) : null;
    await candidate.save();
    res.status(200).send({
      status: 'success',
      message: 'Candidate details successfully updated!',
    });
  } catch (err) {
    res.status(500).send({status: 'error', message: err.message});
  }
};

export const updateCandidateByAdmin = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      dob,
      mobileNo,
      experience,
      currentAddress,
      educationDetails,
      areaOfInterest,
      futureGoal,
      candidateQuestion,
      collegeId,
      step,
    } = req.body;
    const _id = req.params.id;
    const user = await Candidate.findOne({email: email});
    if (user) {
      return res
          .status(409)
          .send({status: 'failed', message: 'Email already exists!'});
    }

    const candidate = await Candidate.findOne({_id: _id});

    if (!candidate) {
      return res.status(404).send({
        status: 'failed',
        message: `Candidate doesn\'t exist with this ID`,
      });
    }

    firstName ? (candidate.firstName = firstName) : null;
    lastName ? (candidate.lastName = lastName) : null;
    email ? (candidate.email = email) : null;
    middleName ? (candidate.middleName = middleName) : null;
    dob ? (candidate.dob = dob) : null;
    mobileNo ? (candidate.mobileNo = mobileNo) : null;
    experience ? (candidate.experience = experience) : null;
    currentAddress ? (candidate.currentAddress = currentAddress) : null;
    educationDetails ? (candidate.educationDetails = educationDetails) : null;
    areaOfInterest ? (candidate.areaOfInterest = areaOfInterest) : null;
    futureGoal ? (candidate.futureGoal = futureGoal) : null;
    candidateQuestion ?
      (candidate.candidateQuestion = candidateQuestion) :
      null;
    collegeId ? (candidate.college = collegeId) : null;
    step ? (candidate.step = step) : null;
    await candidate.save();
    return res.status(200).send({
      status: 'success',
      message: 'Candidate details successfully updated!',
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

export const deleteCandidate = async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await Candidate.findOne({_id: _id});

    if (user) {
      const result = await Candidate.deleteOne({_id: _id});
      return res.status(201).send({
        status: 'Success',
        message: `${result.deletedCount} document deleted`,
      });
    } else {
      return res.status(404).send({
        status: 'failed',
        message: `User doesn\'t exist with this ID`,
      });
    }
  } catch (err) {
    return res.status(500).send({status: 'failed', message: err.message});
  }
};
