const { model } = require("mongoose");

const HistoryEntry = model("HistoryEntry");

exports.read = async () => {
  return await HistoryEntry.find({}).exec();
};

exports.create = async (entryData) => {
  if (entryData._id) {
    const entry = await HistoryEntry.findByIdAndUpdate(
      entryData._id,
      entryData,
      { new: true, overwrite: true }
    );
    return entry;
  }
  const entry = new HistoryEntry(entryData);
  await entry.save();
  return entry;
};

exports.delete = async (ids) => {
  const result = await HistoryEntry.deleteMany({ _id: { $in: ids } });
  return { success: true, deletedCount: result.deletedCount };
};
