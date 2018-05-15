const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CATEGORIES_SCHEMA = {};
CATEGORIES_SCHEMA.CATEGORIES = {
  name: String,
  slug: String,
  position: Number,
  commision: Number, //Minimum Hourly Rate
  level: { type: Number, default: 1, required: false },
  status: Number,
  skills:[],
  image: String,
  img_name:String,
  img_path:String,
  icon:String,
  activeicon:String,
  icon_name:String,
  icon_path:String,
  marker:String,
  seo: {
    title: String,
    keyword: String,
    description: String
  },
  admincommision: Number,
  parent: { type: Schema.ObjectId, ref: 'category' },
  classification: { type: String, default: "service"}
};

module.exports = CATEGORIES_SCHEMA;
