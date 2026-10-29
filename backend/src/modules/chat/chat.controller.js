const service = require('./chat.service');

async function getConversation(req, res, next) {
  try {
    const conversation = await service.getOrCreateConversation(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
}

async function getMessages(req, res, next) {
  try {
    const messages = await service.getMessages(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
}

async function sendMessage(req, res, next) {
  try {
    const message = await service.sendMessageRest(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body.content
    );
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
}

module.exports = { getConversation, getMessages, sendMessage };