const builder = require('xmlbuilder');
const db = require('../../controller/adaptor/mongodb.js');
const async = require('async');
const axios = require('axios');
const $ = require('cheerio');


module.exports = function () {
  const router = {};

  router.sitemap = function (req, res) {

    async.waterfall([
      function (callback) {
        db.GetOneDocument('settings', {'alias': 'general'}, {}, {}, function (err, settings) {
          callback(err, settings.settings);
        });
      },
      function (settings, callback) {
        db.GetDocument('category', {'status': {$eq: 1}, parent: {$exists: false}}, {}, {}, function (err, categories) {
          callback(err, settings, categories);
        });
      }, function (settings, categories, callback) {
        db.GetDocument('pages', {'status': {$eq: 1}}, {}, {}, function (err, pagedata) {
          callback(err, settings, categories, pagedata);
        });
      }
    ], function (err, settings, categories, pagedata) {

      let urls = [];
      data.loc = settings.site_url;
      //data.changefreq = 'weekly';
      //data.priority = '0.8';
      urls.push(data);

      for (let i = 0; i < categories.length; i++) {
        const data = {};
        data.loc = settings.site_url + 'category/' + categories[i].slug;
        //data.lastmod = categories[i].updatedAt;
        urls.push(data);
      }

      for (let i = 0; i < pagedata.length; i++) {
        const data = {};
        data.loc = settings.site_url + 'page/' + pagedata[i].slug;
        //data.lastmod = pagedata[i].updatedAt;
        urls.push(data);
      }

      const xmlJSON = {
        urlset: {
          '@xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
          url: urls
        }
      };
      const xml = builder.create(xmlJSON, {encoding: 'utf-8'});
      res.header('Content-Type', 'application/xml');
      res.send(xml.end({pretty: true}));
    });
  };

  router.courierGuy = function courierGuy(req, res) {
    const waybill = req.body.waybill;
    const url = `http://tracking.parcelperfect.com/waybill.php?ppcust=2500.2500.3364&waybill=${waybill}`;

    const buildData = (htmlData) => {
      let data = {
        waybill_detail: {},
        pod_detail: {},
        signature: '',
        references: [],
        events: [],
      };
      const dataBody = $('table tbody tr', htmlData).next().html();
      // 1: Waybill Details, 2:POD Details, 3: third body
      const waybillBody = $('table', dataBody).get(1);
      const podBody = $('table', dataBody).get(2);
      const thirdBody = $('table', dataBody).get(3);
      const sigBody = $('table', thirdBody).get(0);
      const refBody = $('table', thirdBody).get(1);
      const eventBody = $('table', thirdBody).get(2);
      const tem = $('tbody', eventBody).html();

      const waybillsTr = $('table tbody>tr', waybillBody).get(2);
      const waybills = $('td', waybillsTr);
      data.waybill_detail = {
        waybill: $(waybills[0]).text().trim(),
        date: $(waybills[1]).text().trim(),
        consignee: $(waybills[2]).text().trim(),
        service: $(waybills[3]).text().trim(),
        orig_hub: $(waybills[4]).text().trim(),
        dest_hub: $(waybills[5]).text().trim(),
        pieces: $(waybills[6]).text().trim(),
      };

      const podTr = $('tbody>tr', podBody).get(2);
      const pods = $('td', podTr);
      data.pod_detail = {
        date: $(pods[0]).text().trim(),
        time: $(pods[1]).text().trim(),
        recipient: $(pods[2]).text().trim(),
        details: $(pods[3]).text().trim(),
      };

      const podImg = $('img', sigBody).attr('src');
      data.signature = `http://tracking.parcelperfect.com/${podImg}`;

      const refTr = $('tbody>tr', refBody);
      for (let i=2; i<refTr.length; i++) {
        const refs = $('td', refTr[i]);
        data.references.push({
          number: $(refs[0]).text().trim(),
          page: $(refs[1]).text().trim(),
          message: $(refs[2]).text().trim(),
        });
      }

      const eventTr = $('tbody>tr', eventBody);
      for (let i=2; i<eventTr.length; i++) {
        const events = $('td', eventTr[i]);
        data.events.push({
          date: $(events[0]).text().trim(),
          time: $(events[1]).text().trim(),
          details: $(events[2]).text().trim(),
        });
      }

      return data;
    };

    if (waybill) {
      axios.get(url, {
        params: {}
      })
        .then(function (_res) {
          const data = buildData(_res.data);
          res.status(200).send(data);
        })
        .catch(function (_err) {
          res.status(500).send(_err);
        });
    } else {
      res.status(404).send('Not Found.');
    }
  };

  return router;
};
