var BRANDS_SCHEMA = {};
BRANDS_SCHEMA.BRANDS = {
  name: String,
  status: Number,
  image: String,
  img_name:String,
  img_path:String,
  seo: {
    title: String,
    keyword: String,
    description: String
  }
};

module.exports = BRANDS_SCHEMA;
