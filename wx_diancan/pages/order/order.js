// pages/order/order.js
var app = getApp()
var common = require('../../utils/server.js');
Page({
  data: {
    orderList: [],
    count: 0,
    total: 0,
    pay: 0,
    is_empty: false,
    openid:{}
  },
  onLoad: function (option) {
    if (option.pay) {
      var pay = option.pay;
      if (parseFloat(option.total) > 0)
        var is_empty = true;
      else
        var is_empty = false;
    }
    else {
      var pay = 0;
    }
    var orderList = wx.getStorageSync('orderList');
    var cartList = []
    for (var index in orderList.cartList) {
      if (pay == 0) var is_empty = false;
      if (!common.isEmptyObject(orderList.cartList[index])) {

        var total = 0;
        if (pay == 0) is_empty = true;
        for (var key in orderList.cartList[index]) {
          total += orderList.cartList[index][key].num * orderList.cartList[index][key].price;
        }
        var orderDetail = {
          name: orderList.cartList[index][0].shopName,
          shopId: orderList.cartList[index][0].shopId,
          order: orderList.cartList[index],
          total: total,
          pay: orderList.cartList[index][0].pay,
        }
        cartList.push(orderDetail);
      }
    }
    var openid = wx.getStorageSync('user');
    this.setData({
      total: orderList.total,
      count: orderList.count,
      orderList: cartList,
      pay: pay,
      is_empty: is_empty,
      openid: openid
    });
  },
  onShow: function () {},
    confirm: function () {
    var templateData = this.data.orderList;
    console.log('tem:'+JSON.stringify(templateData));
    var res = wx.getStorageSync('orderList');
    if (res) {
      var cartList = res.cartList;
    }
    var openid = wx.getStorageSync('user');
      var URL = 'http://47.107.168.130:8883/wxpay?openid=' + openid.openid ;
      var aa = res.cartList[1];
      var obj = aa[0];
      // console.log('res:' + JSON.stringify(obj)); 
      if (obj.name == "姜葱白切鸡饭" || obj.name == "盐焗手撕鸡饭" || obj.name == "手撕鸡拼鼓油鸡"){
        wx.request({
          url: URL,
          method: 'GET', 
          success: function (res) {
            console.log(res)
            wx.requestPayment(
              {
                'timeStamp': res.data.timeStamp,
                'nonceStr': res.data.nonceStr,
                'package': res.data.package,
                'signType': 'MD5',
                'paySign': res.data.paySign,
                'success': function (res) { 
                  console.log("success:" + res);
                  wx.showToast({
                    title: '支付成功',
                    icon: 'success',
                    duration: 2000
                  })
                  wx.request({
                    url: 'https://dev.vantiq.cn/api/v1/resources/procedures/order',
                    data: { obj },
                    method: 'POST',
                    header: {
                      'content-type': 'application/json',
                      'Authorization': 'Bearer euvRfo9M7_svpwvl-eVhLETQi4C5vA0E_Zw19VoSx4w='
                    },
                    success: function (res) {
                      console.log("success send to vantiq!");
                    }
                  })
                  wx.removeStorageSync('orderList');
                  wx.navigateBack();
                },
                'fail': function (res) { 
                  console.log("fail:" + JSON.stringify(res));
                  wx.showToast({
                    title: '支付失败',
                    icon: 'none',
                    duration: 2000
                  })
                },
                'complete': function (res) {
                  console.log("complete:" + JSON.stringify(res));
                 }
              })
            // if (res.data.errcode) {
            //   wx.showModal({
            //     showCancel: false,
            //     title: '恭喜',
            //     content: '订单发送成功！下订单过程顺利完成，你看到的费用暂不包括配送费以及优惠。',
            //     success: function (res) {
            //       if (res.confirm) {
            //         wx.removeStorageSync('orderList');
            //         wx.navigateBack();
            //       }
            //     }
            //   })
            //   for(var index in cartList){
            //   	if(typeof cartList[index] !== null){
            //   		for(var key in cartList[index]){
            //   			cartList[index]['pay'] = 1;
            //   		}
            //   	}								
            //   }
            //   wx.setStorage({
            //   	key: 'orderList',
            //   	data: {
            //   		cartList: cartList,
            //   		count: res.count,
            //   		total: res.total,s
            //   	}
            //   });
            //}
            // else {
            //   console.log('下单失败');
            //   wx.showModal({
            //     showCancel: false,
            //     title: '提交订单失败',
            //     content: '请在重新授权后提交订单',
            //     success: function (res) {
            //       if (res.confirm) {
            //         app.getUserInfo();
            //       }
            //     }
            //   })
            // }
          }
        })
    }
    else{
        wx.showToast({
          title: '提交订单失败,请重新选择菜品',
          icon: 'none',
          duration: 2000
        })
        // wx.navigateBack();
    }
      }
      

  
});

