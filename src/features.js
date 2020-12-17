// @flow

type ReadType = () => Promise<{| history: boolean |}>;

const read: ReadType = async () => {
  return {
    // TODO query purchased subscriptions, check if it's active
    history: true,
  };
};

exports.read = read;
