var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var USERS_SCHEMA = {};
USERS_SCHEMA.USER = {
  username: { type: String, index: { unique: true }, trim: true },
  email: { type: String, lowercase: true, index: { unique: true }, trim: true },
  password: String,
  media_id: String,
  gcm_id: Number,
  phone: {
    code: String,
    number: String,
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
    country: String,
    mobile: Number,
    street: String,
    landmark: String,
    locality: String
  },

  addressList: [{
    line1: String,
    line2: String,
    city: String,
    state: String,
    zipcode: String,
    mobile: Number,
    country: String,
    location: {
      lat: Number,
      lng: Number
    },
    street: String,
    landmark: String,
    locality: String,
    status: { type: Number, default: 1 }
  }],

  deliveryAddressList: [{
    line1: String,
    line2: String,
    city: String,
    state: String,
    zipcode: String,
    mobile: Number,
    country: String,
    location: {
      lat: Number,
      lng: Number
    },
    street: String,
    landmark: String,
    locality: String,
    status: { type: Number, default: 1 }
  }],

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
  unique_code: { type: String, index: { unique: true }, trim: true },
  verification_code: [],
  avatar: String,
  status: { type: Number, default: 1 },
  wallet_id: { type: Schema.ObjectId },
  location_id: { type: Schema.ObjectId },
  provider_notification: { type: Schema.ObjectId, ref: 'tasker' },
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
  socialnetwork: {
    facebook_link: String,
    twitter_link: String,
    googleplus_link: String
  },
  type: String,
  facebook: {
    id: String,
    token: String,
    name: String,
    profile: String,
    email: String
  },
  twitter: {
    id: String,
    token: String,
    name: String,
    displayName: String
  },
  geo: [],
  google: {
    id: String,
    token: String,
    name: String,
    email: String
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
  reset_code: String,
  emergency_contact: {
    name: String,
    email: String,
    phone: {
      code: String,
      number: Number
    },
    otp: String,
    verification: {
      email: Number,
      phone: Number
    }
  },
  mode: String,
  availability: { type: Number, default: 1 },
  bio: String,
  banking: {
    acc_holder_name: String,
    acc_holder_address: String,
    acc_number: String,
    bank_name: String,
    branch_name: String,
    branch_address: String,
    swift_code: String,
    routing_number: String
  },
  cancellation_reason: String,
  device_info: {
    device_type: String, //ios/android
    device_token: String,
    gcm: String,
    android_notification_mode: String, //socket/gcm
    ios_notification_mode: String, //socket/apns
    //notification_mode: String //socket/apns/gcm
  },
  skills: [{
    _id: false,
    categoryid: { type: Schema.ObjectId, ref: 'categories' },
    childid: { type: Schema.ObjectId, ref: 'categories' },
    name: String,
    quick_pitch: String,
    skills: String,
    salary: { type: Number, required: false, default: 0},
    hour_rate: { type: Number, required: false, default: 0},
    unit_price: { type: Number, required: false, default: 0},
    capacity_rate: { type: Number, required: false, default: 0},
    inventory: { type: Number, required: false, default: 0},
    km_rate: Number,
    experience: { type: Schema.ObjectId, ref: 'experience' },
    experience_year: { type: Schema.ObjectId, ref: 'experience_year' },
    travel_arrangement: { type: Schema.ObjectId, ref: 'travel_arrangement' },
    status: { type: Number, default: 1 },
    career_attachment: String,
    demand_name: String,
    demand_description: String,
    demand_specification: String,
    demand_images: [{type: String}],
    product_image: String,
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
  availability_address: String,
  radius: Number,
  radiusby: String,
  provider_location: {
    provider_lng: Number,
    provider_lat: Number
  },
  current_task: { type: Schema.ObjectId, ref: 'task' },
  // working_area: Object,
  tasker_area: {
    lat: Number,
    lng: Number
  },
};
module.exports = USERS_SCHEMA;
