import College from '../modals/college.js';

export const colleges = async (req, res) => {
  try {
    const colleges = await College.find().sort({_id: -1});
    return res.status(200).send({status: 'success',
      message: 'colleges retrieved successfully', colleges});
  } catch (err) {
    return res.status(500).send({status: 'failed', message: err.message});
  }
};

export const college = async (req, res) => {
  const id = req.params.id;
  try {
    const college = await College.findById(id);
    if (!college) {
      return res.status(404).send({
        status: 'failed',
        message: 'College not found',
      });
    }

    res.status(200).send(college);
  } catch (error) {
    res.status(500).send({
      status: 'failed',
      message: 'Unable to retrieve college',
      error: error.message,
    });
  }
};

export const createCollege = async (req, res) => {
  const {name} = req.body;
  const date = new Date().toUTCString();

  try {
    if (!name) {
      return res.status(400).send({
        status: 'failed',
        message: 'name is required',
      });
    }

    const existingCollege = await College.findOne({name});

    if (existingCollege) {
      return res.status(409).send({
        status: 'failed',
        message: 'College already exists',
      });
    }

    const college = new College({
      name: name,
      registerDate: date,
    });

    await college.save();

    res.status(201).send({
      status: 'success',
      message: 'College Added Successfully',
    });
  } catch (error) {
    res.status(500).send({
      status: 'failed',
      message: 'Unable to add college',
      error: error.message,
    });
  }
};

export const updateCollege = async (req, res) => {
  try {
    const {name} = req.body;
    const {id} = req.params;

    if (!name || name.length < 1) {
      return res
          .status(400)
          .send({status: 'failed', message: 'Please enter a college name!'});
    }

    const newValues = {
      $set: {
        name: name,
      },
    };

    await College.updateOne({_id: id}, newValues);
    res.status(200).send({status: 'success', message: 'College updated!'});
  } catch (error) {
    res.status(500).send({
      status: 'error',
      message: error.message,
    });
  }
};

export const deleteCollege = async (req, res) => {
  try {
    const _id = req.params.id;
    const college = await College.findOneAndDelete({_id});

    if (!college) {
      return res.status(404).send({
        status: 'failed',
        message: `College doesn\'t exist with this ID`,
      });
    }

    return res.status(200).send({
      status: 'success',
      message: `${college.deletedCount} document deleted`,
    });
  } catch (error) {
    return res.status(500).send({
      status: 'failed',
      message: 'Failed to delete',
      error: error.message,
    });
  }
};
