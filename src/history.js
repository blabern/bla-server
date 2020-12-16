const { model } = require("mongoose");

const HistoryEntry = model("HistoryEntry");

exports.create = async (entryData) => {
  const entry = new HistoryEntry(entryData);
  await entry.save();
  return entry;
};

exports.read = async (userId) => {
  return await HistoryEntry.find({ userId }).exec();
};

exports.update = async (id, entryData) => {
  return await HistoryEntry.findByIdAndUpdate(id, entryData, {
    new: true,
    overwrite: true,
  });
};

exports.delete = async (ids) => {
  const result = await HistoryEntry.deleteMany({ _id: { $in: ids } });
  return { success: true, deletedCount: result.deletedCount };
};
