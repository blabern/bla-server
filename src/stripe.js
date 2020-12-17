// @flow
const { model } = require("mongoose");
const camelcaseKeys = require("camelcase-keys");
const fetch = require("node-fetch");

const Purchase = model("Purchase");
const User = model("User");

type ReadType = (string) => Promise<[]>;

const read: ReadType = async (userId) => [];

module.exports = { read };
