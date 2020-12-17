const { model } = require("mongoose");

const HistoryEntry = model("HistoryEntry");

const create = async (entryData) => {
  const entry = new HistoryEntry(entryData);
  await entry.save();
  return entry;
};

const read = async (userId) => {
  return await HistoryEntry.find({ userId }).exec();
};

const update = async (id, entryData) => {
  return await HistoryEntry.findByIdAndUpdate(id, entryData, {
    new: true,
    overwrite: true,
  });
};

const del = async (ids) => {
  const result = await HistoryEntry.deleteMany({ _id: { $in: ids } });
  return { success: true, deletedCount: result.deletedCount };
};

module.exports = { create, read, update, del };
