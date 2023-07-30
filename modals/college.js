import mongoose from 'mongoose';

const CollegeSchema = new mongoose.Schema({
  name: String,
  registerDate: Date,
});

const College = mongoose.model('College', CollegeSchema);

export default College;
