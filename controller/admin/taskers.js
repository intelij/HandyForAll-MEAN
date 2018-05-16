module.exports = function (app, io) {
  var db = require('../../controller/adaptor/mongodb.js');
  var bcrypt = require('bcrypt-nodejs');
  var CONFIG = require('../../config/config');
  var mailcontent = require('../../model/mailcontent.js');
  var mongoose = require('mongoose');
  var async = require("async");
  var library = require('../../model/library.js');
  var taskerLibrary = require('../../model/tasker.js')(io);
  var attachment = require('../../model/attachments.js');

  var router = {};

  router.getpendinglist = function (req, res) {
    db.GetDocument('tasker', {status: {$eq: 3}}, {}, {}, function (err, shops) {
      if (err) {
        res.send(err);
      } else {
        res.send(shops);
      }
    });
  };

  router.checktaskerphoneno = function (req, res) {
    console.log("req.body", req.body);
    db.GetOneDocument('tasker', {
      "phone.code": req.body.data.phone.code,
      "phone.number": req.body.data.phone.number
    }, {phone: 1}, {}, function (err, pdocdata) {
      if (err) {
        res.send(err);
      } else {
        if (pdocdata) {
          res.send({msg: 'Phone Number Already Exists'});
        } else {
          db.GetOneDocument('tasker', {'username': req.body.data.username}, {}, {}, function (err1, tasker) {
            console.log("err, tasker", err1, tasker);
            if (err1) {
              res.send(err1);
            } else {
              if (tasker) {
                res.send({msg: 'Username Already Exists'});
              } else {
                db.GetOneDocument('tasker', {'email': req.body.data.email}, {}, {}, function (err2, taskeremail) {
                  console.log("err, tasker", err2, taskeremail);
                  if (err2) {
                    res.send(err2);
                  } else {
                    if (taskeremail) {
                      res.send({msg: 'Email Id Already Exists'});
                    } else {
                      res.send({msg: 'success'});
                    }
                  }
                });
              }
            }
          });
        }
      }
    });
  };

  router.getusers = function (req, res) {
    db.GetDocument('users', {}, {}, {}, function (err, docdata) {
      if (err) {
        res.send(err);
      } else {
        res.send(docdata);
      }
    });
  };

  router.currentUser = function (req, res) {
    req.checkBody('currentUserData', 'Invalid currentUserData').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      res.send(errors, 400);
      return;
    }
    db.GetDocument('users', {
      username: req.body.currentUserData
    }, {username: 1}, {}, function (err, docdata) {
      if (err) {
        res.send(err);
      } else {
        res.send(docdata);
      }
    });
  };

  router.save = function (req, res) {
    var data = {
      activity: {}
    };
    /*   if (req.file) {
           data.avatar = req.file.destination + req.file.filename;
       }*/
    /*  req.checkBody('username', 'Invalid username').notEmpty();
         req.checkBody('name', 'Invalid name').notEmpty();
         req.checkBody('gender', 'Invalid gender').notEmpty();
         req.checkBody('about', 'Invalid about').notEmpty();
         req.checkBody('phone_no', 'Invalid phone_no').notEmpty();
         req.checkBody('email', 'Invalid email').notEmpty();
         req.checkBody('role', 'Invalid role').notEmpty();
         req.checkBody('address', 'Invalid address').notEmpty();
         req.checkBody('status', 'Invalid status').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }*/

    data.name = req.body.name;
    data.birthdate = req.body.birthdate;
    data.username = req.body.username;
    data.gender = req.body.gender;
    data.phone = req.body.phone;
    data.email = req.body.email;
    data.role = req.body.role;
    data.address = req.body.address;
    data.status = req.body.status;
    data.availability_address = req.body.availability_address;
    data.avatarBase64 = req.body.avatarBase64;

    if (data.avatarBase64) {
      var base64 = data.avatarBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      var fileName = Date.now().toString() + '.png';
      var file = './uploads/images/tasker/' + fileName;

      library.base64Upload({file: file, base64: base64[2]}, function () {
      });

      data.avatar = 'uploads/images/tasker/' + fileName;
      data.img_name = fileName;
      data.img_path = 'uploads/images/tasker/';
    }
    /*    if (req.file) {
            req.body.avatar = attachment.get_attachment(req.file.destination, req.file.filename);
        }
        */

    if (req.body._id) {
      db.GetDocument('tasker', {
        "phone.code": data.phone.code,
        "phone.number": data.phone.number
      }, {}, {}, function (err, pdocdata) {
        if (err) {
          res.send(err);
        } else {
          if ((pdocdata.length !== 0) && (pdocdata.length < 2) && (pdocdata[0]._id.toString() !== req.body._id.toString())) {
            res.send({msg: 'Phone Number Already Exists'});
          } else {
            db.GetDocument('tasker', {'username': data.username}, {}, {}, function (err1, tasker) {
              if (err1) {
                res.send(err1);
              } else {
                if ((tasker.length !== 0) && (tasker.length < 2) && (tasker[0]._id.toString() !== req.body._id.toString())) {
                  res.send({msg: 'Username Already Exists'});
                } else {
                  db.GetDocument('tasker', {'email': data.email}, {}, {}, function (err2, tasker) {
                    if (err2) {
                      res.send(err2);
                    } else {
                      if ((tasker.length !== 0) && (tasker.length < 2) && (tasker[0]._id.toString() !== req.body._id.toString())) {
                        res.send({msg: 'Email Already Exists'});
                      } else {
                        db.UpdateDocument('tasker', {_id: req.body._id}, data, {}, function (err3, docdata) {
                          if (err3) {
                            res.send(err3);
                          } else {
                            db.GetDocument('settings', {'alias': 'general'}, {}, {}, function (err4, settings) {
                              if (err4) {
                                res.send(err4);
                              } else {
                                var name;
                                if (req.body.name) {
                                  name = req.body.name.first_name + " (" + req.body.username + ")";
                                } else {
                                  name = req.body.username;
                                }

                                var mailData = {};
                                if (req.body.status === 1) {
                                  mailData.template = 'Profileapprovel';
                                  mailData.to = req.body.email;
                                  mailData.html = [];
                                  mailData.html.push({name: 'firstname', value: name});
                                  mailData.html.push({name: 'site_url', value: settings[0].settings.site_url});
                                  mailData.html.push({name: 'site_title', value: settings[0].settings.site_title});
                                  mailData.html.push({name: 'logo', value: settings[0].settings.logo});
                                  mailcontent.sendmail(mailData, function () {
                                  });
                                  // res.send({ "status": req.body.status,"data": data});
                                } else {
                                  mailData.template = 'UnverfiedAccount';
                                  mailData.to = req.body.email;
                                  mailData.html = [];
                                  mailData.html.push({name: 'name', value: name});
                                  mailData.html.push({name: 'site_url', value: settings[0].settings.site_url});
                                  mailData.html.push({name: 'site_title', value: settings[0].settings.site_title});
                                  mailData.html.push({name: 'logo', value: settings[0].settings.logo});
                                  mailcontent.sendmail(mailData, function () {
                                  });
                                }
                              }
                            });
                            // res.send(docdata);
                            res.send({msg: 'success', data: docdata});
                          }
                        });
                      }
                    }
                  });
                }
              }
            });
          }
        }
      });
    } else {
      data.activity.created = new Date();
      data.status = 1;
      db.InsertDocument('users', data, function (err, result) {
        if (err) {
          res.send(err);
        } else {
          res.send(result);
        }
      });
    }
  };


  router.savepassword = function (req, res) {
    /*  db.GetOneDocument('tasker', { _id: req.body._id }, { password: 1 }, {}, function (err, docdata) {

          if (err) {
              res.send(err);
          } else {

              bcrypt.compare(req.body.pass, docdata.password, function (err, result) {

                  if (result === true) {
                      req.body.password = bcrypt.hashSync(req.body.new_confirmed, bcrypt.genSaltSync(8), null);

                      db.UpdateDocument('tasker', { _id: req.body._id }, req.body, function (err, docdata) {

                          if (err) {
                              res.send(err);
                          } else {
                              res.send(docdata);
                          }
                      });
                  } else {
                      res.status(400).send("Current password is wrong");
                  }
              });
          }
      });*/
    db.GetOneDocument('tasker', {_id: req.body._id}, {password: 1}, {}, function (err, tasker) {
      if (err) {
        res.send(err);
      } else {
        bcrypt.compare(req.body.newpassword, tasker.password, function (err1, result) {
          if (result === true) {
            res.status(400).send({message: "Not allowing you to add Same Password"});
          } else {
            if (req.body.newpassword === req.body.new_confirmed) {
              req.body.password = bcrypt.hashSync(req.body.new_confirmed, bcrypt.genSaltSync(8), null);
              db.UpdateDocument('tasker', {_id: req.body._id}, req.body, function (err2, docdata) {
                if (err) {
                  res.send(err);
                } else {
                  res.send(docdata);
                }
              });
            } else {
              res.status(400).send({message: "Confirm password is not Match"});
            }
          }
        });
      }
    });
  };

  router.saveNewTaskerPassword = function (req, res) {
    var data = {
      activity: {}
    };

    /*  req.checkBody('password', 'Invalid password').notEmpty();
      req.checkBody('conformpassword', 'Invalid conformpassword').notEmpty();

      var errors = req.validationErrors();
      if (errors) {
          res.send(errors, 400);
          return;
      }*/

    data.password = req.body.password;
    data.conformpassword = req.body.conformpassword;

    if (req.body.conformpassword) {
      data.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
    }
    data.activity.created = new Date();
    data.status = 1;
    //  db.InsertDocument('users',data, function (err, result) {
    db.UpdateDocument('tasker', {_id: req.body._id}, data, {}, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    });
  };


  router.savetaskerprofile = function (req, res) {
    /*    var data ={};
        var profile_details=[];
        data.profile_details =req.body.profile_details;*/
    db.UpdateDocument('tasker', {_id: req.body._id}, {'profile_details': req.body.profile_details}, {}, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    });
  };

  router.saveprof = function (req, res) {
    db.UpdateDocument('tasker', {_id: req.body._id}, {'profile_details': req.body.profile_details}, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    });
  };

  router.edit = function (req, res) {
    db.GetDocument('tasker', {_id: req.body.id}, {}, {}, function (err, data) {
      if (err) {
        res.send(err);
      } else {
        if (!data[0].avatar) {
          data[0].avatar = './' + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
        }
        res.send(data);
      }
    });
  };

  router.addtasker = function (req, res) {
    if (req.body.avatar) {
      var avatar = req.body.avatar;
    }

    if (avatar) {
      var base64 = avatar.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      var fileName = Date.now().toString() + '.png';
      var file = './uploads/images/tasker/' + fileName;

      library.base64Upload({file: file, base64: base64[2]}, function () {
      });

      req.body.avatar = 'uploads/images/tasker/' + fileName;
      req.body.img_name = fileName;
      req.body.img_path = 'uploads/images/tasker/';
    }

    /* req.body = JSON.parse(req.body.tdata);
     if (req.file) {
         req.body.avatar = req.file.destination + req.file.filename;
     }
*/
    if (req.body.conformpassword) {
      req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
    }

    /* if (req.file) {
         req.body.avatar = "";
     }*/
    /*  var data = {};
      data.name           = req.body.name;
      data.birthdate      = req.body.birthdate;
      data.username       = req.body.username;
      data.gender         = req.body.gender;
      data.phone          = req.body.phone;
      data.email          = req.body.email;
      data.role           = req.body.role;
      data.address        = req.body.address;*/

    /*
    if (req.file) {
        data.avatar = req.file.destination + req.file.originalname;
    }
    if (req.file) {
        req.body.avatar = attachment.get_attachment(req.file.destination, req.file.filename);
    }
    */

    // data.password = req.body.password;
    // data.conformpassword = req.body.conformpassword;

    /* if (req.body.conformpassword) {
         data.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
     }
     data.activity = {};
     data.activity.created = new Date();
     data.status = 1;
     //data.profile_details = [];
     data.profile_details = req.body.profile_details;
     data.taskerskills = [];
     data.taskerskills.push(req.body.category);

    */
    // data.working_area     = req.body.working_area;
    // data.working_days    = req.body.working_days;
    // user.working_area = req.body.working_area;
    // user.working_days = req.body.working_days;
    // data.working_days = user.working_days.filter(function (n) { return n !== undefined });

    // res.send(req.body);
    /*
    db.InsertDocument('tasker', data, function (err, result) {

            if (err) {
                res.send(err);
            } else {

                res.send(result);
            }
        });
    };
    */
    /*
    router.addtasker = function (req, res) {
        var data = {};
        data.name = req.body.name;
        data.birthdate = req.body.birthdate;
        data.username = req.body.username;
        data.gender = req.body.gender;
        data.phone = req.body.phone;
        data.email = req.body.email;
        data.role = req.body.role;
        data.address = req.body.address;
        if (req.file) {
            data.avatar = req.file.destination + req.file.originalname;
        }

        if (req.file) {
            req.body.avatar = attachment.get_attachment(req.file.destination, req.file.filename);
        }

        db.InsertDocument('tasker', data, function (err, result) {

            if (err) {
                res.send(err);
            } else {
                res.send(result);
            }
        });
    */

    db.InsertDocument('tasker', req.body, function (err, result) {
      if (err) {
        console.log(err, "errrrrrrrrrrrrrrrrrr");
        res.send(err);
      } else {
        console.log(result, "resrrrrrrrrrrrrrrrrrr");
        res.send(result);
      }
    });
  };

  router.allTaskers = function (req, res) {
    var errors = req.validationErrors();
    if (errors) {
      res.send(errors, 400);
      return;
    }

    if (req.query.sort !== "") {
      var sorted = req.query.sort;
    }
    var usersQuery = [{
      "$match": {status: {$ne: 0}}
    }, {
      $project: {
        username: 1,
        email: 1,
        dname: {$toLower: '$' + sorted},
        activity: 1,
        status: 1

      }
    }, {
      $project: {
        username: 1,
        document: "$$ROOT"
      }
    }, {
      $group: {"_id": null, "count": {"$sum": 1}, "documentData": {$push: "$document"}}
    }];

    var sorting = {};
    var searchs = '';

    if (Object.keys(req.query).length !== 0) {
      usersQuery.push({$unwind: {path: "$documentData", preserveNullAndEmptyArrays: true}});
      if (req.query.search !== '' && req.query.search !== 'undefined' && req.query.search) {
        searchs = req.query.search;
        usersQuery.push({
          "$match": {
            $or: [
              {"documentData.username": {$regex: searchs + '.*', $options: 'si'}},
              {"documentData.email": {$regex: searchs + '.*', $options: 'si'}}

            ]
          }
        });
      }
      if (req.query.sort !== '' && req.query.sort) {
        sorting = {};
        if (req.query.status === 'false') {
          sorting["documentData.dname"] = -1;
          usersQuery.push({$sort: sorting});
        } else {
          sorting["documentData.dname"] = 1;
          usersQuery.push({$sort: sorting});
        }
      }
      if (req.query.limit !== 'undefined' && req.query.skip !== 'undefined') {
        usersQuery.push({'$skip': parseInt(req.query.skip, 10)}, {'$limit': parseInt(req.query.limit, 10)});
      }
      usersQuery.push({$group: {"_id": null, "count": {"$first": "$count"}, "documentData": {$push: "$documentData"}}});
    }

    db.GetAggregation('tasker', usersQuery, function (err, docdata) {
      if (err) {
        res.send(err);
      } else {
        if (docdata.length !== 0) {
          res.send([docdata[0].documentData, docdata[0].count]);
        } else {
          res.send([0, 0]);
        }
      }
    });
  };

  router.getrecenttasker = function (req, res) {
    var errors = req.validationErrors();
    if (errors) {
      res.send(errors, 400);
      return;
    }

    var query = {};
    if (req.body.status === 0) {
      query = {$and: [{status: {$ne: 0}}, {status: {$ne: 10}}]};
    } else {
      query = {status: {$eq: req.body.status}};
    }

    if (req.body.sort) {
      var sorted = req.body.sort.field;
    }

    var usersQuery = [{
      "$match": query
    }, {
      $project: {
        createdAt: 1,
        updatedAt: 1,
        username: 1,
        status: 1,
        email: 1,
        dname: {$toLower: '$' + sorted},
        activity: 1,
        availability: 1
      }
    }, {
      $project: {
        username: 1,
        document: "$$ROOT"
      }
    }, {
      $group: {"_id": null, "count": {"$sum": 1}, "documentData": {$push: "$document"}}
    }];
    usersQuery.push({$unwind: {path: "$documentData", preserveNullAndEmptyArrays: true}});
    if (req.body.search) {
      var searchs = req.body.search;
      usersQuery.push({
        "$match": {
          $or: [
            {"documentData.username": {$regex: searchs + '.*', $options: 'si'}},
            {"documentData.email": {$regex: searchs + '.*', $options: 'si'}}

          ]
        }
      });
      // search limit
      usersQuery.push({$group: {"_id": null, "countvalue": {"$sum": 1}, "documentData": {$push: "$documentData"}}});
      usersQuery.push({$unwind: {path: "$documentData", preserveNullAndEmptyArrays: true}});
      if (req.body.limit && req.body.skip >= 0) {
        usersQuery.push({'$skip': parseInt(req.body.skip, 10)}, {'$limit': parseInt(req.body.limit, 10)});
      }
      usersQuery.push({
        $group: {
          "_id": null,
          "count": {"$first": "$countvalue"},
          "documentData": {$push: "$documentData"}
        }
      });
      // search limit
    }

    var sorting = {};
    if (req.body.sort) {
      var sorter = 'documentData.' + req.body.sort.field;
      sorting[sorter] = req.body.sort.order;
      usersQuery.push({$sort: sorting});
    } else {
      sorting["documentData.createdAt"] = -1;
      usersQuery.push({$sort: sorting});
    }

    if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
      usersQuery.push({'$skip': parseInt(req.body.skip, 10)}, {'$limit': parseInt(req.body.limit, 10)});
    }
    // usersQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
    if (!req.body.search) {
      usersQuery.push({$group: {"_id": null, "count": {"$first": "$count"}, "documentData": {$push: "$documentData"}}});
    }

    db.GetAggregation('tasker', usersQuery, function (err, docdata) {
      var count = {};
      async.parallel([
        // All Tasker
        function (callback) {
          db.GetCount('tasker', {$and: [{status: {$ne: 0}}, {status: {$ne: 10}}]}, function (err1, allValue) {
            if (err1) {
              callback(err1);
              return;
            }
            count.allValue = allValue;
            callback();
          });
        },
        // verified Tasker
        function (callback) {
          db.GetCount('tasker', {status: {$eq: 1}}, function (err1, verifiedValue) {
            if (err1) {
              callback(err1);
              return;
            }
            count.verifiedValue = verifiedValue;
            callback();
          });
        },
        // Un verified Tasker
        function (callback) {
          db.GetCount('tasker', {status: {$eq: 2}}, function (err1, unverifiedValue) {
            if (err1) {
              callback(err1);
              return;
            }
            count.unverifiedValue = unverifiedValue;
            callback();
          });
        },
        // cancel Task
        function (callback) {
          db.GetCount('tasker', {status: {$eq: 3}}, function (err1, pendingValue) {
            if (err1) {
              callback(err1);
              return;
            }
            count.pendingValue = pendingValue;
            callback();
          });
        }
      ], function (error) {
        if (error || docdata.length <= 0) {
          res.send([0, 0]);
        } else {
          res.send([docdata[0].documentData, docdata[0].count, count]);
        }
      });
    });
  };

  router.getAllearnings = function (req, res) {
    db.GetDocument('task', {'status': 7, 'invoice.status': 1}, {}, {}, function (err, data) {
      if (err) {
        res.send(err);
      } else {
        var date = new Date();
        var isodate = date.toISOString();
        db.GetCount('coupon', {
          'status': 1,
          "expiry_date": {"$gte": isodate},
          "valid_from": {"$lte": isodate}
        }, function (error, couponcount) {
          if (error) {
            res.send(error);
          } else {
            db.GetCount('newsletter', {'status': 1}, function (err1, newsletter) {
              if (err1) {
                res.send(err1);
              } else {
                if (data) {
                  var totalearning = 0;
                  var admincomission = 0;
                  for (var key = 0; key < data.length; key++) {
                    if (data[key].invoice.amount.total) {
                      totalearning += data[key].invoice.amount.total;
                    }
                    if (data[key].invoice.amount.admin_commission) {
                      admincomission += data[key].invoice.amount.admin_commission;
                    }
                  }
                  res.send([totalearning, admincomission, couponcount, newsletter]);
                }
              }
            });
          }
        });
      }
    });
  };

  router.delete = function (req, res) {
    req.checkBody('delData', 'Invalid delData').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
      res.send(errors, 400);
      return;
    }
    db.UpdateDocument('tasker', {_id: {$in: req.body.delData}}, {status: 0}, {multi: true}, function (err, docdata) {
      if (err) {
        res.send(err);
      } else {
        res.send(docdata);
      }
    });
  };

  router.getQuestion = function (req, res) {
    db.GetDocument('question', {status: 1}, {}, {}, function (err, docdata) {
      if (err) {
        res.send(err);
      } else {
        res.send(docdata);
      }
    });
  };

  router.approvtaskercategory = function (req, res) {
    db.UpdateDocument('tasker', {
      _id: req.body.data.tasker,
      'taskerskills.childid': req.body.data.category
    }, {$set: {"taskerskills.$.status": req.body.status}}, {}, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        var getQuery = [
          {"$match": {'_id': new mongoose.Types.ObjectId(req.body.data.tasker)}},
          {
            $project: {
              taskerskills: {
                $filter: {
                  input: '$taskerskills',
                  as: 'taskerskill',
                  cond: {$eq: ['$$taskerskill.childid', new mongoose.Types.ObjectId(req.body.data.category)]}
                }
              },
              username: 1,
              email: 1
            }
          },
          {$unwind: '$taskerskills'},
          {'$lookup': {from: 'categories', localField: 'taskerskills.childid', foreignField: '_id', as: 'category'}},
          {$unwind: '$category'}
        ];
        db.GetAggregation('tasker', getQuery, function (err1, docdata) {
          if (err1) {
            res.send(err1);
          } else {
            var categorystatus = "verified";

            if (docdata[0].taskerskills.status === 2) {
              categorystatus = "unverified";
            }

            var mailData = {};
            mailData.template = 'approvtaskercategory';
            mailData.to = docdata[0].email;
            mailData.html = [];
            mailData.html.push({name: 'username', value: docdata[0].username});
            mailData.html.push({name: 'categoryname', value: docdata[0].category.name});
            mailData.html.push({name: 'categorystatus', value: categorystatus});

            mailcontent.sendmail(mailData, function () {
            });

            res.send({"status": req.body.status, "result": result});
          }
        });
      }
    });
  };

  router.saveNewVehicle = function (req, res) {
    db.UpdateDocument('tasker', {_id: req.body._id}, {vehicle: req.body.vehicle}, {}, function (err, docdata) {
      if (err) {
        res.send(err);
      } else {
        res.send(docdata);
      }
    });
  };

  router.getCategories = function (req, res) {
    var getQuery = [{
      "$match": {
        $and: [{status: {$ne: 0}}, {status: {$ne: 2}}]
      }
    }, {
      '$lookup': {
        from: 'categories',
        localField: 'parent',
        foreignField: '_id',
        as: 'parent'
      }
    }, {
      $unwind: {
        path: "$parent",
        preserveNullAndEmptyArrays: true
      }
    }, {
      $project: {
        image: 1,
        name: 1,
        parent: 1,
        seo: 1,
        skills: 1,
        slug: 1,
        status: 1,
        level: 1,
        classification: 1
      }
    }, {
      $project: {
        name: 1,
        document: "$$ROOT"
      }
    }, {
      $group: {"_id": null, "count": {"$sum": 1}, "documentData": {$push: "$document"}}
    }];
    db.GetAggregation('category', getQuery, function (err, docdata) {
      if (err) {
        res.send(err);
      } else if (docdata.length !== 0) {
        res.send(docdata[0].documentData);
      } else {
        res.send([0, 0]);
      }
    });
  };

  router.getusercategories = function (req, res) {
    var options = {};
    options.populate = 'taskerskills.categoryid';
    db.GetOneDocument('tasker', {_id: req.body._id}, {taskerskills: 1}, options, function (err, docdata) {
      if (err) {
        res.send(err);
      } else {
        res.send(docdata.taskerskills);
      }
    });
  };

  router.getExperience = function (req, res) {
    db.GetDocument('experience', {status: 1}, {}, {}, function (err, docdata) {
      if (err) {
        res.send(err);
      } else {
        res.send(docdata);
      }
    });
  };

  router.getTravelArrangementList = function (req, res) {
    db.GetDocument('travel_arrangement', {status: 1}, {}, {}, function (err, docdata) {
      if (err) {
        res.send(err);
      } else {
        res.send(docdata);
      }
    });
  };

  router.gettaskercategory = function (req, res) {
    var options = {};
    options.populate = 'taskerskills.childid';
    db.GetOneDocument('tasker', {_id: req.body._id}, {taskerskills: 1}, options, function (err, docdata) {
      if (err || !docdata) {
        res.send(err);
      } else if (docdata.taskerskills) {
        res.send(docdata.taskerskills);
      } else {
        res.send(docdata);
      }
    });
  };

  router.deleteCategory = function (req, res) {
    db.UpdateDocument('tasker', {_id: req.body.userid}, {$pull: {"taskerskills": {childid: req.body.categoryid}}}, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    });
  };

  router.addcategory = function (req, res) {
    var data = {
      taskerskills: {}
    };
    var userid = req.body.userid;

    if (req.file) {
      data.taskerskills.file = req.file.destination + req.file.filename;
    }

    data.taskerskills.experience = req.body.experience;
    data.taskerskills.travel_arrangement = req.body.travel_arrangement;
    data.taskerskills.hour_rate = !req.body.hour_rate ? 0 : req.body.hour_rate;
    data.taskerskills.km_rate = req.body.km_rate;
    data.taskerskills.unit_price = !req.body.unit_price ? 0 : req.body.unit_price;
    data.taskerskills.inventory = !req.body.inventory ? 0 : req.body.inventory;
    if (req.body.brand)
      data.taskerskills.brand = req.body.brand;
    data.taskerskills.quick_pitch = req.body.quick_pitch;
    data.taskerskills.categoryid = req.body.categoryid;
    data.taskerskills.childid = req.body.childid;
    data.taskerskills.skills = req.body.skills;
    data.taskerskills.terms = req.body.terms;
    data.taskerskills.status = req.body.status;

    if (req.files && req.files.product_image && req.files.product_image.length > 0) {
      data.taskerskills.product_image = attachment.get_attachment(req.files.product_image[0].destination, req.files.product_image[0].filename);
    }

    db.GetOneDocument('tasker', {
      _id: userid,
      'taskerskills.childid': data.taskerskills.childid
    }, {taskerskills: 1}, {}, function (err, docdata) {
      if (docdata) {
        db.UpdateDocument('tasker', {
          _id: userid,
          'taskerskills.childid': data.taskerskills.childid
        }, {$set: {"taskerskills.$": data.taskerskills}}, function (error, result) {
          if (error) {
            res.send(error);
          } else {
            res.send(result);
          }
        });
      } else {
        db.UpdateDocument('tasker', {_id: userid}, {$push: {"taskerskills": data.taskerskills}}, function (error, result) {
          if (error) {
            res.send(error);
          } else {
            res.send(result);
          }
        });
      }
    });
  };

  /**
  router.addNewCategory = function (req, res) {
    var data = {};
    data.taskerskills = {};
    var userid = req.body.userid;
    data.taskerskills.experience = req.body.experience;
    data.taskerskills.travel_arrangement = req.body.travel_arrangement;
    data.taskerskills.hour_rate = req.body.hour_rate;
    data.taskerskills.km_rate = req.body.km_rate;
    data.taskerskills.quick_pitch = req.body.quick_pitch;
    data.taskerskills.categoryid = req.body.categoryid;
    data.taskerskills.childid = req.body.childid;
    data.taskerskills.skills = req.body.skills;
    data.taskerskills.terms = req.body.terms;
    var options = {};
    options.populate = 'taskerskills.categoryid';
    db.GetOneDocument('tasker', {
      _id: userid,
      'taskerskills.categoryid': data.taskerskills.categoryid
    }, {taskerskills: 1}, options, function (err, docdata) {
      if (err || !docdata) {
        db.UpdateDocument('tasker', {_id: userid}, {$push: {"taskerskills": data.taskerskills}}, function (error, result) {
          if (error) {
            res.send(error);
          } else {
            res.send(result);
          }
        });
      } else {
        db.UpdateDocument('tasker', {
          _id: userid,
          'taskerskills.categoryid': data.taskerskills.categoryid
        }, {$set: {"taskerskills.$": data.taskerskills}}, function (error, result) {
          if (error) {
            res.send(error);
          } else {
            res.send(result);
          }
        });
      }
    });
  };
   //*/

  router.category = function (req, res) {
    var options = {};
    options.populate = 'taskerskills.categoryid';
    db.GetOneDocument('tasker', {_id: req.body._id}, {}, options, function (err, docdata) {
      if (err) {
        res.send(err);
      } else {
        res.send(docdata.taskerskills);
      }
    });
  };

  router.saveAvailability = function (req, res) {
    var user = {};
    user.working_area = req.body.working_area;
    user.location = req.body.location;
    user.working_days = req.body.working_days;
    user.radius = req.body.radius;
    user.radiusby = req.body.radiusby;
    user.availability_address = req.body.availability_address;
    user.working_days = user.working_days.filter(function (n) {
      return n !== undefined;
    });

    db.UpdateDocument('tasker', {_id: req.body._id}, user, function (err, docdata) {
      if (err) {
        res.send(err);
      } else {
        res.send(docdata);
      }
    });
  };

  router.mapsave = function (req, res) {
    var user = {};
    user.working_area = req.body.working_area;
    user.working_days = req.body.working_days;
    user.working_days = user.working_days.filter(function (n) {
      return n !== undefined;
    });
    db.UpdateDocument('tasker', {_id: req.body._id}, user, function (err, docdata) {
      if (err) {
        res.send(err);
      } else {
        res.send(docdata);
      }
    });
  };

  router.gettaskerdetails = function (req, res) {
    db.GetOneDocument('settings', {'alias': 'general'}, {}, {}, function (err, settings) {
      var getQuery = [{
        "$match": {role: 'tasker', status: {$nin: [1, 0]}}
      }, {
        $project: {
          email: 1,
          username: 1,
          status: 1,
          "avatar": {
            $ifNull: ["$avatar", settings.settings.site_url + CONFIG.USER_PROFILE_IMAGE_DEFAULT]
          }
        }
      }, {
        $project: {
          name: 1,
          document: "$$ROOT"
        }
      }, {
        $limit: 10
      }, {
        $group: {"_id": "_id", "count": {"$sum": 1}, "documentData": {$push: "$document"}}
      }];
      db.GetAggregation('tasker', getQuery, function (error, data) {
        if (error) {
          res.send(error);
        } else if (data.length !== 0) {
          for (var i = 0; i < data[0].count; i++) {
            if (data[0].documentData[i].avatar === '') {
              data[0].documentData[i].avatar = settings.settings.site_url + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
            }
          }
          res.send(data[0].documentData);
        } else {
          res.send([0]);
        }
      });
    });
  };

  router.verifiedtaskerdetails = function (req, res) {
    db.GetOneDocument('settings', {'alias': 'general'}, {}, {}, function (err, settings) {
      var getQuery = [{
        "$match": {role: 'tasker', status: {$nin: [2, 3, 0]}}
      }, {
        $project: {
          email: 1,
          username: 1,
          status: 1,
          "avatar": {
            $ifNull: ["$avatar", settings.settings.site_url + CONFIG.USER_PROFILE_IMAGE_DEFAULT]
          }
        }
      }, {
        $project: {
          name: 1,
          document: "$$ROOT"
        }
      }, {
        $limit: 10
      }, {
        $group: {"_id": "_id", "count": {"$sum": 1}, "documentData": {$push: "$document"}}
      }];
      db.GetAggregation('tasker', getQuery, function (error, data) {
        if (error) {
          res.send(error);
        } else {
          if (data.length !== 0) {
            for (var i = 0; i < data[0].count; i++) {
              if (data[0].documentData[i].avatar === '') {
                data[0].documentData[i].avatar = settings.settings.site_url + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
              }
            }
            res.send(data[0].documentData);
          } else {
            res.send([0]);
          }
        }
      });
    });
  };

  router.getuserdetails = function (req, res) {
    db.GetOneDocument('settings', {'alias': 'general'}, {}, {}, function (err, settings) {
      var getQuery = [{
        "$match": {role: 'user', status: {$ne: 0}}
      }, {
        $project: {
          email: 1,
          username: 1,
          status: 1,
          createdAt: 1,

          "avatar": {
            $ifNull: ["$avatar", settings.settings.site_url + CONFIG.USER_PROFILE_IMAGE_DEFAULT]
          }
        }
      }, {
        $project: {
          document: "$$ROOT"
        }
      }, {
        $sort: {
          "document.createdAt": -1
        }
      }, {
        $limit: 10
      }, {
        $group: {"_id": "_id", "count": {"$sum": 1}, "documentData": {$push: "$document"}}
      }];
      db.GetAggregation('users', getQuery, function (error, data) {
        if (error) {
          res.send(error);
        } else {
          if (data.length !== 0) {
            res.send(data[0].documentData);
          } else {
            res.send([0]);
          }
        }
      });
    });
  };
  router.gettaskdetails = function (req, res) {
    var extension = {};
    extension.options = {limit: 10};
    extension.populate = 'user tasker';
    db.GetDocument('task', {status: {$nin: [10, 0]}}, {}, extension, function (err, data) {
      if (err) {
        res.send(err);
      } else {
        res.send(data);
      }
    });
  };
  router.deletuserdata = function (req, res) {
    db.UpdateDocument('users', {'_id': req.body.data}, {'status': 0}, {}, function (err, data) {
      if (err) {
        res.send(err);
      } else {
        res.send(data);
      }
    });
  };
  router.approvetasker = function (req, res) {
    db.UpdateDocument('tasker', {'_id': req.body.data}, {'status': req.body.status}, {}, function (err, data) {
      if (err) {
        res.send(err);
      } else {
        db.GetDocument('tasker', {'_id': req.body.data}, {}, {}, function (err1, taskerdata) {
          if (err1) {
            res.send(err1);
          } else {
            db.GetDocument('settings', {'alias': 'general'}, {}, {}, function (err2, settings) {
              if (err2) {
                res.send(err2);
              } else {
                var name;
                if (taskerdata[0].name) {
                  name = taskerdata[0].name.first_name + " (" + taskerdata[0].username + ")";
                } else {
                  name = taskerdata[0].username;
                }
                var mailData = {};
                mailData.template = 'Profileapprovel';
                mailData.to = taskerdata[0].email;
                mailData.html = [];
                mailData.html.push({name: 'firstname', value: name});
                mailData.html.push({name: 'site_url', value: settings[0].settings.site_url});
                mailData.html.push({name: 'site_title', value: settings[0].settings.site_title});
                mailData.html.push({name: 'logo', value: settings[0].settings.logo});
                mailcontent.sendmail(mailData, function () {});
                res.send({"status": req.body.status, "data": data});
              }
            });
          }
        });
        //    res.send({ "status": req.body.status, "data": data });
      }
    });
  };

  router.updateAvailability = function (req, res) {
    var data = {};
    data.tasker = req.body._id;
    data.availability = req.body.availability;

    taskerLibrary.updateAvailability(data, function (err, response) {
      if (err) {
        res.send(err);
      } else {
        res.send(response);
      }
    });
    /*
    var user = {};
    user.availability = req.body.availability;
    db.UpdateDocument('tasker', { _id: req.body._id }, user, function (err, docdata) {
        if (err) {
            res.send(err);
        } else {
            res.send(docdata);
        }
    });
    */
  };
  router.getChild = function (req, res) {
    db.GetOneDocument('category', {_id: req.body.id}, {}, {}, function (err, docdata) {
      if (err) {
        res.send(err);
      } else {
        res.send(docdata);
      }
    });
  };

  router.saveaccountinfo = function (req, res) {
    var request = {};
    request.userid = req.body.userId;
    request.banking = {};
    request.banking.acc_holder_name = req.body.acc_holder_name;
    request.banking.acc_holder_address = req.body.acc_holder_address;
    request.banking.acc_number = req.body.acc_number;
    request.banking.bank_name = req.body.bank_name;
    request.banking.branch_name = req.body.branch_name;
    request.banking.branch_address = req.body.branch_address;
    request.banking.swift_code = req.body.swift_code;
    request.banking.routing_number = req.body.routing_number;

    db.UpdateDocument('tasker', {'_id': request.userid}, {'banking': request.banking}, {}, function (err, response) {
      if (err || response.nModified === 0) {
        res.send(err);
      } else {
        res.send(response);
      }
    });
  };

  router.getDeletedTaskers = function (req, res) {
    var errors = req.validationErrors();
    if (errors) {
      res.send(errors, 400);
      return;
    }

    if (req.body.sort) {
      var sorted = req.body.sort.field;
    }

    var usersQuery = [{
      "$match": {status: {$eq: 0}, "role": "tasker"}
    }, {
      $project: {
        createdAt: 1,
        updatedAt: 1,
        username: 1,
        status: 1,
        email: 1,
        dname: {$toLower: '$' + sorted},
        activity: 1,
        availability: 1
      }
    }, {
      $project: {
        username: 1,
        document: "$$ROOT"
      }
    }, {
      $group: {"_id": null, "count": {"$sum": 1}, "documentData": {$push: "$document"}}
    }];

    usersQuery.push({$unwind: {path: "$documentData", preserveNullAndEmptyArrays: true}});

    if (req.body.search) {
      var searchs = req.body.search;
      usersQuery.push({
        "$match": {
          $or: [
            {"documentData.username": {$regex: searchs + '.*', $options: 'si'}},
            {"documentData.email": {$regex: searchs + '.*', $options: 'si'}}

          ]
        }
      });
    }

    var sorting = {};
    if (req.body.sort) {
      var sorter = 'documentData.' + req.body.sort.field;
      sorting[sorter] = req.body.sort.order;
      usersQuery.push({$sort: sorting});
    } else {
      sorting["documentData.createdAt"] = -1;
      usersQuery.push({$sort: sorting});
    }

    if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
      usersQuery.push({'$skip': parseInt(req.body.skip, 10)}, {'$limit': parseInt(req.body.limit, 10)});
    }
    usersQuery.push({$group: {"_id": null, "count": {"$first": "$count"}, "documentData": {$push: "$documentData"}}});

    db.GetAggregation('tasker', usersQuery, function (err, docdata) {
      var count = {};
      async.parallel([
        // All DeleTasker
        function (callback) {
          db.GetCount('tasker', {status: {$eq: 0}}, function (error, allValue) {
            if (error) {
              callback(error);
              return;
            }
            count.allValue = allValue;
            callback();
          });
        }
      ], function (error) {
        if (error || docdata.length <= 0) {
          res.send([0, 0]);
        } else {
          res.send([docdata[0].documentData, docdata[0].count, count]);
        }
      });
    });
  };

  return router;
};
