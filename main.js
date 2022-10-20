const token = "token"; 
const telegramUrl = "https://api.telegram.org/bot" + token;
const webAppUrl = "app";
const adminChatID = -1001411024898;


function setWebhook() {
  var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
  var response = UrlFetchApp.fetch(url);
}

function sendMessageResponce(chat_id, text) {
  var url = telegramUrl + "/sendMessage?chat_id=" + chat_id + "&text="+ text;
  var response = UrlFetchApp.fetch(url);
  return response.getContentText();
}

function editMessageResponce(chat_id, message_id, text) {
  var url = telegramUrl + "/editMessageText?chat_id=" + chat_id + "&message_id="+ message_id + "&text="+ text;
  var response = UrlFetchApp.fetch(url);
  return response.getContentText();   
}

function sendMessage(chat_id, text, pasteParams) {
  if (chat_id == adminChatID) {
    if (pasteParams.checkNewUser) {
      editQuestion (pasteParams);
    } else {
      response = sendMessageResponce(chat_id, text)
      let position = response.search("message_id");
      messageId = response.substring(position+12, position+17);
      messageId = messageId.split(',', 1);
      pasteQuestion(
        pasteParams.id,
        pasteParams.username,
        pasteParams.text,
        messageId
      );
    }
  } else {
    response = sendMessageResponce(chat_id, text);
  }
}


function doPost(e) {
  var contents = JSON.parse(e.postData.contents);
  var chat_id = adminChatID; 
  var text = contents.message.from.id + " @" + contents.message.from.username + " asks:" + " '" + contents.message.text + "'";

  if (contents.message.chat.id != adminChatID) {
    var pasteParams = new PasteParams(
      contents.message.from.id, 
      contents.message.from.username, 
      contents.message.text, 
      checkNewUser(contents.message.from.id)
    );
    sendMessage(chat_id, text, pasteParams);
  } else {
    var userId = getUserId(contents.message.reply_to_message.text);
    var answerText = contents.message.text;
    sendMessage(userId, answerText);
    sendMessage(userId, "Did it help?");
    pasteAnswer (userId, answerText)
  }
}

function checkNewUser (userId) {
  var techList = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tech");
  var lastRow = techList.getLastRow();
  var ids = techList.getRange(2,1,lastRow).getValues();
  for (i=0; i < lastRow; i++) {
    if (ids[i] == userId) {
      console.log(i+2)
      return i+2;
    }
  }
  console.log(false)
  return false;
}


function pasteQuestion (id, username, text, message_id) {
  var techList = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tech");
  var lastRow = techList.getLastRow();
  techList.getRange(lastRow + 1, 1).setValue(id);
  techList.getRange(lastRow + 1, 2).setValue(username);
  techList.getRange(lastRow + 1, 3).setValue(text);
  var date = new Date();
  techList.getRange(lastRow + 1, 4).setValue(date);
  techList.getRange(lastRow + 1, 5).setValue(message_id);
}

function editQuestion (pasteParams) {
  var techList = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tech");
  var prevText = techList.getRange(pasteParams.checkNewUser, 3).getValue();
  var blankText = pasteParams.id + " @" + pasteParams.username + " asks: '";
  var updatedText =  prevText + " / " + pasteParams.text;
  techList.getRange(pasteParams.checkNewUser, 3).setValue(updatedText);
  var message_id = techList.getRange(pasteParams.checkNewUser, 5).getValue();
  editMessageResponce(adminChatID, message_id, blankText + updatedText + "'");
} 

function pasteAnswer (id, text) {
  var techList = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tech");
  var lastRow = techList.getLastRow();
  var ids = techList.getRange(2,1,lastRow).getValues();
  for (i=0; i < lastRow; i++) {
    if (ids[i] == id) {
      techList.getRange(i+2,6).setValue(text);
      var date = new Date();
      techList.getRange(i+2,7).setValue(date);
      break;
    }
  }
}

function getUserId (text) {
  const arr = text.split(" ");
  return arr[0];
}

function getUserStatus (id)



class PasteParams {
  constructor(id, username, text, checkNewUser) {
    this.id = id;
    this.username = username;
    this.text = text;
    this.checkNewUser = checkNewUser;
  }
};
