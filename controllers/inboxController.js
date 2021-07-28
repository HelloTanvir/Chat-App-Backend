/* eslint-disable no-underscore-dangle */
const createHttpError = require('http-errors');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const People = require('../models/People');
const cloudinary = require('../utils/cloudinary');

// get all conversations
const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            $or: [{ 'creator.id': req.user._id }, { 'participant.id': req.user._id }],
        });

        // const conversations = await Conversation.find({ 'creator.id': req.user._id });

        res.status(200).json({
            message: `Conversations associated with user: ${req.user.email} `,
            data: conversations,
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({
            errors: {
                common: {
                    msg: err.message || 'Server error occured',
                },
            },
        });
    }
};

// add conversation
const addConversation = async (req, res) => {
    try {
        if (req.body.participantEmail === req.user.email) {
            return res.status(400).json({
                errors: {
                    email: {
                        msg: 'This is your own email!',
                    },
                },
            });
        }

        const participant = await People.findOne({ email: req.body.participantEmail });

        if (!participant) {
            return res.status(400).json({
                errors: {
                    email: {
                        msg: 'No user found with that email',
                    },
                },
            });
        }

        const conversations = await Conversation.find({
            $and: [{ 'participant.email': participant.email }, { 'creator.email': req.user.email }],
        });

        if (conversations.length > 0) {
            return res.status(400).json({
                errors: {
                    email: {
                        msg: `You already have a conversation with ${participant.name}`,
                    },
                },
            });
        }

        // test if this logic working
        const conversationAsParticipant = await Conversation.findOne({
            $and: [{ 'creator.email': participant.email }, { 'participant.email': req.user.email }],
        });

        if (conversationAsParticipant) {
            return res.status(200).json({
                data: conversationAsParticipant,
            });
        }
        // test end

        const newConversation = new Conversation({
            creator: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                image: req.user.image || null,
            },
            participant: {
                id: participant._id,
                name: participant.name,
                email: participant.email,
                image: participant.image || null,
            },
        });

        const result = await newConversation.save();

        return res.status(201).json({
            message: 'Conversation was added successfully!',
            data: result,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            errors: {
                common: {
                    msg: err.message || 'Server error occured',
                },
            },
        });
    }
};

// get messages of a conversation
const getMessages = async (req, res, next) => {
    try {
        // const messages = await Message.find({
        //     conversation_id: req.params.conversation_id,
        // }).sort('-createdAt');

        const messages = await Message.find({
            conversation_id: req.params.conversation_id,
        });

        const { participant } = await Conversation.findById(req.params.conversation_id);

        res.status(200).json({
            data: {
                messages,
                participant,
            },
            user: req.user._id,
            conversation_id: req.params.conversation_id,
        });
    } catch (err) {
        next(createHttpError(500, err.message || 'Server error occured'));
    }
};

// send new message
const sendMessage = async (req, res, next) => {
    if (req.body.message || (req.files && req.files.length > 0)) {
        try {
            // save message text/attachment in database
            let attachments = null;

            if (req.files && req.files.length > 0) {
                attachments = [];

                req.files.forEach(async (file) => {
                    const uploadedImage = await cloudinary.uploader.upload(file.path, {
                        folder: 'Chat-App/Attachments',
                    });

                    attachments.push(uploadedImage.secure_url);
                });
            }

            const newMessage = new Message({
                text: req.body.message,
                attachment: attachments,
                sender: {
                    id: req.user._id,
                    email: req.user.email,
                    image: req.user.image || null,
                },
                receiver: {
                    id: req.body.receiverId,
                    email: req.body.receiverEmail || null,
                    image: req.body.receiverImage || null,
                },
                conversation_id: req.body.conversationId,
            });

            const result = await newMessage.save();

            // emit socket event
            global.io.emit('new_message', {
                message: {
                    conversation_id: req.body.conversationId,
                    sender: {
                        id: req.user._id,
                        email: req.user.email,
                        image: req.user.image || null,
                    },
                    text: req.body.message,
                    attachment: attachments,
                    date_time: result.date_time,
                },
            });

            res.status(200).json({
                message: 'Successful!',
                data: result,
            });
        } catch (err) {
            next(createHttpError(500, err.message || 'Server error occured'));
        }
    } else {
        next(createHttpError(400, 'Text or attachment is required'));
    }
};

module.exports = { getConversations, addConversation, getMessages, sendMessage };
