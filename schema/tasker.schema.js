var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TASKER_SCHEMA = {};
TASKER_SCHEMA.TASKER = {
  username: { type: String, index: { unique: true }, trim: true },
  email: { type: String, lowercase: true, index: { unique: true }, trim: true },
  password: String,

  phone: {
    code: String,
    number: String
  },
  otp: String,
  gender: String,
  about: String,
  name: {
    first_name: String,
    last_name: String
  },
  avg_review: { type: Number, default: 0 },
  total_review: { type: Number, default: 0 },
  address: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },

  role: String,
  activity: {
    last_login: { type: Date, default: Date.now },
    last_logout: { type: Date, default: Date.now },
    last_active_time: { type: Date, default: Date.now }
  },
  referal_code: String,
  refer_history: [{
    reference_id: String,
    reference_mail: String,
    amount_earns: Number,
    reference_date: Date,
    used: String
  }],
  unique_code: String,
  verification_code: [],
  avatar: String,
  status: { type: Number, default: 1 },
  tasker_status: { type: Number, default: 0 },
  location_id: { type: Schema.ObjectId },
  billing_address: {
    name: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
    phone: String
  },
  location: {
    lng: Number,
    lat: Number
  },
  availability_address: String,
  radius: Number,
  radiusby: String,
  socialnetwork: {
    facebook_link: String,
    twitter_link: String,
    googleplus_link: String
  },

  birthdate: {
    year: Number,
    month: Number,
    date: Number
  },
  profile_details: [{
    _id: false,
    question: { type: Schema.ObjectId, ref: 'question' },
    answer: String
  }],
  taskerskills: [{
    _id: false,
    categoryid: { type: Schema.ObjectId, ref: 'categories' },
    childid: { type: Schema.ObjectId, ref: 'categories' },
    // terms: Boolean,
    name: String,
    quick_pitch: String,
    hour_rate: { type: Number, required: false, default: 0},
    km_rate: Number,
    unit_price: { type: Number, required: false, default: 0},
    experience: { type: Schema.ObjectId, ref: 'experience' },
    travel_arrangement: { type: Schema.ObjectId, ref: 'travel_arrangement' },
    brand: { type: Schema.ObjectId, ref: 'brand', required: false },
    inventory: { type: Number, default: 0, required: false },
    product_image: { type: String, required: false },
    status: { type: Number, default: 1 },
    demand_name: {type: String, required: false},
    demand_description: {type: String, required: false},
    demand_specification: {type: String, required: false},
    demand_image: {type: String, required: false},
  }],
  working_days: [{
    _id: false,
    day: String,
    value: { type: Number, default: 0 },
    hour: {
      morning: { type: Schema.Types.Mixed, default: false },
      afternoon: { type: Schema.Types.Mixed, default: false },
      evening: { type: Schema.Types.Mixed, default: false }
    }
  }],
  // working_area: Object,
  tasker_area: {
    lat: Number,
    lng: Number
  },
  // stripe_connect: Object,
  /*
  stripe: {
      customer: String
  },
  */
  reset_code: String,
  emergency_contact: {
    name: String,
    email: String,
    phone: {
      code: Number,
      number: String
    },
    otp: String,
    verification: {
      email: String,
      phone: Number
    }
  },
  mode: String,
  availability: { type: Number, default: 1 },
  // bio: String,
  banking: {},
  device_info: {
    device_type: String, // ios/android
    device_token: String,
    gcm: String,
    android_notification_mode: String, // socket/gcm
    ios_notification_mode: String, // socket/apns
    notification_mode: String // socket/apns/gcm
  },
  provider_location: {
    provider_lng: Number,
    provider_lat: Number
  },
  current_task: { type: Schema.ObjectId, ref: 'task' }

};
module.exports = TASKER_SCHEMA;
