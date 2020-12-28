// @flow
const { HistoryEntryModel } = require("./models");

type CreateType = ($Shape<HistoryEntryModel>) => Promise<HistoryEntryModel>;

const create: CreateType = async (entryData) => {
  const entry = new HistoryEntryModel(entryData);
  await entry.save();
  return entry;
};

type ReadType = (bson$ObjectId) => Promise<HistoryEntryModel[]>;

const read: ReadType = async (userId) => {
  return await HistoryEntryModel.find({ userId }).exec();
};

type UpdateType = (
  string,
  $Shape<HistoryEntryModel>
) => Promise<?HistoryEntryModel>;

const update: UpdateType = async (id, entryData) => {
  const entry = await HistoryEntryModel.findByIdAndUpdate(id, entryData, {
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
  const result = await HistoryEntryModel.deleteMany({ _id: { $in: ids } });
  return { success: true, deletedCount: result.deletedCount };
};

type DownloadType = (bson$ObjectId) => Promise<string>;

const download: DownloadType = async (userId) => {
  const history = await read(userId);
  return history
    .map((entry) => {
      const original = entry.words.map((word) => word.text).join(" ");
      return [original, entry.mainTranslation].join(",");
    })
    .join("\n");
};

module.exports = { create, read, update, del, download };
