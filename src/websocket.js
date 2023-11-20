export function connectWebSocket(url, params) {
    const socket = new WebSocket(url + '?' + params);
    var resMsg = ''

    // 连接建立时触发
    socket.onopen = function(event) {
        console.log("WebSocket连接已建立");
    };

    // 接收到消息时触发
    socket.onmessage = function(event) {
        resMsg = event.data;
        // console.log("接收到消息：" + resMsg);
    };

    // 连接关闭时触发
    socket.onclose = function(event) {
        console.log("WebSocket连接已关闭");
    };

    // 发生错误时触发
    socket.onerror = function(event) {
        console.error("WebSocket发生错误: " + event);
    };

    // 发送消息
    function sendMessage(message) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(message);
            return resMsg
        } else {
            console.error("WebSocket连接未建立");
        }
    }

    // 关闭连接
    function closeWebSocket() {
        socket.close();
    }

    return {
        sendMessage,
        closeWebSocket,
    };
}