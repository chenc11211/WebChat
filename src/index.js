import 'bootstrap';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './style.css';

$(function () {

  var $messageList = $('#message-list');
  var io = null;
  // 基本信息更新
  var infoUpdata = (function () {
    var $count = $('#current-count');
    return function (msg) {
      $count.html(msg.currentCount);
      console.log(msg.currentCount);
    }
  })();
  // 登入消息
  function msgLogin(msg) {
    $messageList.append($('<div class="system-info text-center text-info"><span>'+msg.name+'</span>加入了聊天室</div>'))
  }
  // 登出消息
  function msgLogout(msg) {
    $messageList.append($('<div class="system-info text-center text-info"><span>'+msg.name+'</span>离开了聊天室</div>'))
  }
  // 用户消息
  function msgMsg(msg) {
    $messageList.append($('<div class="media"><div class="media-left"><img class="user-icon" src="302147b5bd9187c429dbbd99d18c3506.png" alt=""><div class="user-name">'+msg.name+'</div></div><div class="media-body"><span class="message-content left">'+msg.content+'</span></div></div>'))
  }

  //滚动到底部
  function toBottom($el) {
    $el.stop(true, false).animate({ scrollTop: $el.children().height() }, 500);
  }

  // 消息发布
  var $pushBtn = $('#push-btn'),
      $pushMsg = $('#push-msg');
  $pushMsg.on('keydown', function (e) {
    if (e.which === 13) {
      $pushBtn.trigger('click');
    }
  });
  var pushMessage = (function () {
    var msgId = 0;
    return function (io) {
      $pushBtn.on('click', function (e) {
        $(this).attr('disabled', 'disabled');
        var msg = $.trim($pushMsg.val());
        if (msg) {
          var id = 'msg' + msgId++;
          try {
            io.send(JSON.stringify({ type: 'msg', content: msg }));
            $messageList.append($('<div id="'+id+'" class="media"><div class="media-body clearfix"><div class="message-content pull-right right"><div>'+msg+'</div><div class="cycle-circle loading"><div class="circle-out"><div class="circle-in"></div></div></div></div></div><div class="media-right"><img class="user-icon" src="302147b5bd9187c429dbbd99d18c3506.png" alt=""><div class="user-name"></div></div></div>'));
            toBottom($messageList.parent());
          } catch (e) {
            $('$id .loading').removeClass('loading success').addClass('error').on('click', function () {
              try {
                io.send(JSON.stringify({ type: 'msg', content: $(this).prev().html() }));
                $(this).removeClass('error').addClass('loading');
              } catch (e) {
                $(this).removeClass('loading').addClass('error');
              }
              $(this).addClass('success');
            });
          }
          $('#'+id+' .loading').addClass('success');

        }
        $pushMsg.val('');
        $(this).removeAttr('disabled');
      })
    };
  })();

  // 登录框初始显示
  $('#login-box').modal('show');
  //登录提交
  $('#login-btn').on('click', function (e) {
    $(this).attr('disabled', 'disabled')
    var name = $.trim($('#set-name').val());
    if (name) {
      io = new WebSocket('ws://127.0.0.1:3000');
      //监听服务器消息推送事件
      io.onmessage = function (msg) {
        msg = JSON.parse(msg.data);
        switch (msg.type) {
          case 'login':
            infoUpdata(msg);
            msgLogin(msg);
            break;
          case 'logout':
            infoUpdata(msg);
            msgLogout(msg);
            break;
          case 'msg':
            msgMsg(msg);
            break;
        }
        toBottom($messageList.parent());
      }
      io.onopen = function (e) {
          //链接建立后发送登录信息
          io.send(JSON.stringify({ type: 'login', id: Math.random()+''+Date.now(), name: name }));
          $('#login-btn').removeAttr('disabled');
          $('#login-box').modal('hide');
          // 绑定消息发送事件
          pushMessage(io);
      }
    } else {
      $('#login-btn').removeAttr('disabled');
    }
    $('#set-name').val('');
  });






});
