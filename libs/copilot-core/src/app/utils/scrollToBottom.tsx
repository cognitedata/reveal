export const scrollToBottom = () => {
  const messagesDiv = document.querySelector('.botui_message_list');
  if (messagesDiv) {
    if (messagesDiv.parentElement) {
      messagesDiv.parentElement.scrollTop = messagesDiv.scrollHeight;
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
};
