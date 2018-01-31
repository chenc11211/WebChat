const WebSocket = require('ws');
const io = new WebSocket.Server({ port:3000 });
console.log('socket server open');
let users = [];
let currentCount = 0;
//消息广播
io.broadCast = function (currentClient, msg) {
  io.clients.forEach(function (client) {
    if (client !== currentClient) {
      client.send(msg);
    }
  });
}

io.on('connection', function (socket) {
  console.log('has connected!');
  socket.on('message', function (msg) {
    console.log('msg:'+msg+'/'+socket.id);
    msg = JSON.parse(msg);

    if (msg.type === 'login') {// 登录
      if (users[msg.id] != undefined) {
        return;
      }else {
        users[msg.id] = { name: msg.name, time: Date.now() };
        socket.id = msg.id;
        currentCount++;
        io.clients.forEach(function (client) {
          client.send(JSON.stringify({ type: 'login', name: msg.name, currentCount: currentCount }));
        });
      }
    } else if (socket.id) {//发送消息
      io.broadCast(socket, JSON.stringify({ type: 'msg', name: users[socket.id].name, content: msg.content }));
    }
  });

  socket.on('error', (reason) => {
    console.log('error');
  });

  socket.on('close', () => {
    console.log('close');
    currentCount--;
    //广播用户离开
    io.broadCast(socket, JSON.stringify({ type: 'logout', name: users[socket.id].name, currentCount: currentCount }));
    //移除离线用户
    users.splice(users.indexOf(users[socket.id], 1));
  });

});
