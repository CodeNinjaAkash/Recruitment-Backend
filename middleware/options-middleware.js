const SameOptions = (req, res, next) => {
  const titles = req.body.options.map((option) => option.title);
  if (new Set(titles).size !== titles.length) {
    res.send({status: 'failed', message: 'Duplicate options not allowed!'});
  } else {
    next();
  }
};
export default SameOptions;
