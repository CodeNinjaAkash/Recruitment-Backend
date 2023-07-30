/**
 * Adds two numbers together.
 * @param {*} model
 * @param {*} populate
 * @return {*} .
 */
function paginate(model, populate = '') {
  return (req, res, next) => {
    const pagination = async () => {
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const result = {};
      result.dataSize = await model.countDocuments().exec();
      if (endIndex < result.dataSize) {
        result.next = {
          page: page + 1,
          limit: limit,
        };
      }
      if (startIndex > 0) {
        result.previous = {
          page: page - 1,
          limit: limit,
        };
      }
      try {
        result.results = await model
            .find()
            .sort({_id: -1})
            .limit(limit)
            .skip(startIndex)
            .populate(populate);
        res.send(result);
      } catch (error) {
        res.status(500).json({status: 'failed', message: 'pagination failed', error: error});
      }
    };
    pagination();
  };
}

export default paginate;
