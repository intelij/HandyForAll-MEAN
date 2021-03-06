var app = angular.module('handyforall.task');
app.factory('TaskService', TaskService);

function TaskService($http, $q) {
  var taskService = {
    taskbaseinfo: taskbaseinfo,
    checktaskeravailability: checktaskeravailability,
    getTaskerByGeoFilter: getTaskerByGeoFilter,
    getTaskerByGeoFiltermap:getTaskerByGeoFiltermap,
    gettaskuser: gettaskuser,
    //createOrder: createOrder,
    taskprofileinfo: taskprofileinfo,
    taskerreviews: taskerreviews,
    saveuser: saveuser,
    addtask: addtask,
    getTaskDetailsbyid: getTaskDetailsbyid,
    confirmtask: confirmtask,
    deleteaddress: deleteaddress,
    getaddressdata: getaddressdata,
    AddAddress: AddAddress,
    AddDeliveryAddress: AddDeliveryAddress,
    addressStatus: addressStatus,
    searchTasker: searchTasker,
    taskerCount: taskerCount,
    getuserdata:getuserdata,
    taskdetails:taskdetails,
    profileconfirmtask:profileconfirmtask
  };

  return taskService;

  function taskbaseinfo(data) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/site/task/taskbaseinfo/',
      data: { slug: data }
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function getaddressdata(data) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/site/task/getaddressdata/',
      data: data
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
  function getuserdata(data) {
    //  console.log(data);
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/site/task/getuserdata/',
      data: {data:data}
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function deleteaddress(data) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/site/task/deleteaddress/',
      data: data
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function AddAddress(userid, data, usertype) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/site/task/addaddress/',
      data: {
        userid: userid,
        data: data,
        usertype: !usertype ? 'user' : usertype
      }
    }).success(function (response) {
      deferred.resolve(response);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function AddDeliveryAddress(userid, data) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/site/task/add_delivery_address/',
      data: {
        userid: userid,
        data: data,
        usertype: !usertype ? 'user' : usertype
      }
    }).success(function (response) {
      deferred.resolve(response);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function taskerreviews(data) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/site/task/taskerreviews',
      data: { slug: data }
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function taskprofileinfo(data) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/site/task/taskprofileinfo',
      data: data
    }).success(function (response) {
      deferred.resolve(response);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function checktaskeravailability(location, categoryId, requester) {
    var url = '/site/task/taskerAvailabilitybyWorkingAreaCount?' + $.param({
      lat: location.lat,
      lon: location.lng,
      categoryid: categoryId,
      requester: !requester ? 'user' : requester
    });

    var deferred = $q.defer();

    $http({
      method: 'GET',
      url: url
    }).success(function (response) {
      deferred.resolve(response);
    }).error(function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  }

  function gettaskuser(filter) {
    var url = '/site/task/gettaskuser';
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: url,
      data: { user: filter.tasker, categoryid: filter.categoryid, hour: filter.hour, day: filter.day, loginUser: filter.loginUser, vehicle: filter.vechile }
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function getTaskerByGeoFilter(filter, page, itemsPerPage) {
    let url = '';
    let categoryid = "";
    let taskid = "";
    let date = "";
    let time = "";
    const requester = !filter.requester || filter.requester == 'user' ? 'user' : 'tasker';

    if (angular.isDefined(filter.date)) {
      date = filter.date;
    }
    if (angular.isDefined(filter.time)) {
      time = filter.time;
    }

    if (angular.isDefined(filter.categoryid)) {
      categoryid = filter.categoryid;
    }
    if (angular.isDefined(filter.task)) {
      taskid = filter.task;
    }
    let vechile = "";
    if (angular.isDefined(filter.vechile)) {
      vechile = filter.vechile;
    }
    let lon = "";
    if (angular.isDefined(filter.lon)) {
      lon = filter.lon;
    }
    let day = "";
    if (angular.isDefined(filter.day)) {
      day = filter.day;
    }
    let hour = "";
    if (angular.isDefined(filter.hour)) {
      hour = filter.hour;
    }
    let minvalue = "";
    if (angular.isDefined(filter.minvalue)) {
      minvalue = filter.minvalue;
    }
    let maxvalue = "";
    if (angular.isDefined(filter.maxvalue)) {
      maxvalue = filter.maxvalue;
    }
    let kmminvalue = "";
    if (angular.isDefined(filter.kmminvalue)) {
      kmminvalue = filter.kmminvalue;
    }
    let kmmaxvalue = "";
    if (angular.isDefined(filter.kmmaxvalue)) {
      kmmaxvalue = filter.kmmaxvalue;
    }

    const lat = filter.lat || '';
    const lng = filter.lng || '';
    const categoryname = filter.categoryname || '';

    if (taskid) {
      if (page) {
        let skip = (parseInt(page) - 1) * itemsPerPage;
        url = `/site/task/taskeravailabilitybyWorkingArea?page=${page}&skip=${skip}&limit=${itemsPerPage}&vechile=${vechile}&categoryid=${categoryid}&day=${day}&hour=${hour}&time=${time}&task=${taskid}&date=${date}&minvalue=${minvalue}&maxvalue=${maxvalue}&kmminvalue=${kmminvalue}&kmmaxvalue=${kmmaxvalue}`;
      } else {
        url = `/site/task/taskeravailabilitybyWorkingArea?page=${page}&skip=0&limit=${itemsPerPage}&vechile=${vechile}&categoryid=${categoryid}&day=${day}&hour=${hour}&time=${time}&task=${taskid}&date=${date}&minvalue=${minvalue}&maxvalue=${maxvalue}&kmminvalue=${kmminvalue}&kmmaxvalue=${kmmaxvalue}`;
      }
    } else {
      if (page) {
        let skip = (parseInt(page) - 1) * itemsPerPage;
        url = `/site/task/tasker_availability_by_category?page=${page}&skip=${skip}&limit=${itemsPerPage}&vechile=${vechile}&categoryid=${categoryid}&day=${day}&hour=${hour}&time=${time}&date=${date}&minvalue=${minvalue}&maxvalue=${maxvalue}&kmminvalue=${kmminvalue}&kmmaxvalue=${kmmaxvalue}&lat=${lat}&lng=${lng}&categoryname=${categoryname}`;
      } else {
        url = `/site/task/tasker_availability_by_category?page=${page}&skip=0&limit=${itemsPerPage}&vechile=${vechile}&categoryid=${categoryid}&day=${day}&hour=${hour}&time=${time}&date=${date}&minvalue=${minvalue}&maxvalue=${maxvalue}&kmminvalue=${kmminvalue}&kmmaxvalue=${kmmaxvalue}&lat=${lat}&lng=${lng}&categoryname=${categoryname}`;
      }
    }

    url += '&requester=' + requester;

    const deferred = $q.defer();
    let result =1;
    if (result === 1) {
      $http({
        method: 'GET',
        url: url
      }).success(function (data) {
        deferred.resolve(data);
      }).error(function (err) {
        deferred.reject(err);
      });
      result = 2;
      return deferred.promise;
    }

  }

  function getTaskerByGeoFiltermap(filter, page, itemsPerPage) {
    let url = '';
    let categoryid = "";
    let taskid = "";
    let date = "";
    if (angular.isDefined(filter.date)) {
      date = filter.date;
    }
    let time = "";
    if (angular.isDefined(filter.time)) {
      time = filter.time;
    }

    if (angular.isDefined(filter.categoryid)) {
      categoryid = filter.categoryid;
    }
    if (angular.isDefined(filter.task)) {
      taskid = filter.task;
    }
    let vechile = "";
    if (angular.isDefined(filter.vechile)) {
      vechile = filter.vechile;
    }
    let lon = "";
    if (angular.isDefined(filter.lon)) {
      lon = filter.lon;
    }
    let lat = "";
    if (angular.isDefined(filter.lat)) {
      lat = filter.lat;
    }
    let day = "";
    if (angular.isDefined(filter.day)) {
      day = filter.day;
    }
    let hour = "";
    if (angular.isDefined(filter.hour)) {
      hour = filter.hour;
    }
    let minvalue = "";
    if (angular.isDefined(filter.minvalue)) {
      minvalue = filter.minvalue;
    }
    let maxvalue = "";
    if (angular.isDefined(filter.maxvalue)) {
      maxvalue = filter.maxvalue;
    }
    let kmminvalue = "";
    if (angular.isDefined(filter.kmminvalue)) {
      kmminvalue = filter.kmminvalue;
    }
    let kmmaxvalue = "";
    if (angular.isDefined(filter.kmmaxvalue)) {
      kmmaxvalue = filter.kmmaxvalue;
    }

    if (taskid) {
      if (page) {
        let skip = (parseInt(page) - 1) * itemsPerPage;
        url = `/site/task/taskeravailabilitybyWorkingAreaMap?page=${page}&skip=${skip}&limit=${itemsPerPage}&vechile=${vechile}&categoryid=${categoryid}&day=${day}&hour=${hour}&time=${time}&task=${taskid}&date=${date}&minvalue=${minvalue}&maxvalue=${maxvalue}&kmminvalue=${kmminvalue}&kmmaxvalue=${kmmaxvalue}`;
      } else {
        url = `/site/task/taskeravailabilitybyWorkingAreaMap?page=${page}&skip=0&limit=${itemsPerPage}&vechile=${vechile}&categoryid=${categoryid}&day=${day}&hour=${hour}&time=${time}&task=${taskid}&date=${date}&minvalue=${minvalue}&maxvalue=${maxvalue}&kmminvalue=${kmminvalue}&kmmaxvalue=${kmmaxvalue}`;
      }
    } else {
      if (page) {
        let skip = (parseInt(page) - 1) * itemsPerPage;
        url = `/site/task/tasker_availability_by_category?page=${page}&skip=${skip}&limit=${itemsPerPage}&vechile=${vechile}&categoryid=${categoryid}&day=${day}&hour=${hour}&time=${time}&date=${date}&minvalue=${minvalue}&maxvalue=${maxvalue}&kmminvalue=${kmminvalue}&kmmaxvalue=${kmmaxvalue}`;
      } else {
        url = `/site/task/tasker_availability_by_category?page=${page}&skip=0&limit=${itemsPerPage}&vechile=${vechile}&categoryid=${categoryid}&day=${day}&hour=${hour}&time=${time}&date=${date}&minvalue=${minvalue}&maxvalue=${maxvalue}&kmminvalue=${kmminvalue}&kmmaxvalue=${kmmaxvalue}`;
      }
    }

    const deferred = $q.defer();
    let result =1;
    if(result === 1){
      $http({
        method: 'GET',
        url: url
      }).success(function (data) {
        deferred.resolve(data);
      }).error(function (err) {
        deferred.reject(err);
      });
      result = 2;
      return deferred.promise;
    }
  }

  /*
  function createOrder(data) {
      var deferred = $q.defer();
      $http({
          method: 'POST',
          url: '/site/task/create-order',
          data: { taskPayment: data }
      }).success(function (data) {
          deferred.resolve(data);
      }).error(function (err) {
          deferred.reject(err);
      });
      return deferred.promise;
  };
  */

  function saveuser(data) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/site/task/saveuser',
      data: data
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  function addtask(data) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/site/task/addnewtask',
      data: data
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };

  function getTaskDetailsbyid(id) {
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/site/task/gettaskdetailsbyid',
      data: { id: id }
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function confirmtask(data, time) {
    var sendData = { data: data, time: time } // data and time
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/site/task/confirmtask',
      data: sendData
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function addressStatus(data) {
    var deferred = $q.defer();
    $http({
      method: 'PUT',
      url: '/site/task/addressStatus',
      data: data
    }).success(function (response) {
      deferred.resolve(response);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function searchTasker(task, requester) {
    const deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/site/task/search-tasker',
      data: {
        task: task,
        requester: !requester || requester == 'user' ? 'user' : 'tasker'
      }
    }).success(function (response) {
      deferred.resolve(response);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }


  function taskerCount(task,itemsPerPage,page) {
    var skip = (parseInt(page) - 1) * itemsPerPage;
    var url = '/site/task/taskerCount?page=' + page + '&skip=' + skip + '&limit=' + itemsPerPage + '&task=' + task;
    var deferred = $q.defer();
    $http({
      method: 'GET',
      url: url
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function taskdetails(task) {
    console.log(task);
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/site/task/gettask',
      data: {task:task}
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }

  function profileconfirmtask(task) {
    console.log(task);
    var deferred = $q.defer();
    $http({
      method: 'POST',
      url: '/site/task/profileConfirm',
      data: task
    }).success(function (data) {
      deferred.resolve(data);
    }).error(function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  }
}
