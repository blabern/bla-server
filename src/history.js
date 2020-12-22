// @flow
const { HistoryEntry } = require("./models");

type CreateType = ($Shape<HistoryEntry>) => Promise<HistoryEntry>;

const create: CreateType = async (entryData) => {
  const entry = new HistoryEntry(entryData);
  await entry.save();
  return entry;
};

type ReadType = (bson$ObjectId) => Promise<HistoryEntry>;

const read: ReadType = async (userId) => {
  return await HistoryEntry.find({ userId }).exec();
};

type UpdateType = (string, $Shape<HistoryEntry>) => Promise<?HistoryEntry>;

const update: UpdateType = async (id, entryData) => {
  const entry = await HistoryEntry.findByIdAndUpdate(id, entryData, {
    new: true,
    overwrite: true,
    useFindAndModify: false,
  });
  return entry;
};

type DeleteType = (
  string[]
) => Promise<{|
  success: true,
  deletedCount: number,
|}>;

const del: DeleteType = async (ids) => {
  const result = await HistoryEntry.deleteMany({ _id: { $in: ids } });
  return { success: true, deletedCount: result.deletedCount };
};

module.exports = { create, read, update, del };
