const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { string } = require('joi');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    }
});

const Contact = mongoose.model('Contact', contactSchema);

router.get('/', async (req, res) => {
    const contacts = await Contact
        .find()
        .sort('name')
        .select('id name phone email');
    res.send(contacts);
});

router.post('/', async (req, res) => {
    const { error } = validatecontact(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let contact = new Contact({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email
    });
    contact = await contact.save();
    res.send(contact);
});

router.put('/:id', async (req, res) => {
    const { error } = validatecontact(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const contact = await Contact
        .findByIdAndUpdate(req.params.id,
            { name: req.body.name, phone: req.body.phone, email: req.body.email },
            { new: true })
        .select('id name phone email');
    if (!contact) return res.status(404).send('The contact with the given ID was not found.');
    res.send(contact);
});

router.delete('/:id', async (req, res) => {
    const contact = await Contact.findByIdAndRemove(req.params.id);
    if (!contact) return res.status(404).send('The contact with the given ID was not found.');
    res.send(contact);
});

router.get('/:id', async (req, res) => {
    const contact = await Contact
        .findById(req.params.id)
        .select('id name phone email');
    if (!contact) return res.status(404).send('The contact with the given ID was not found.');
    res.send(contact);
});

function validatecontact(contact) {
    const schema = Joi.object({
        name: Joi.string().max(30).required(),
        phone: Joi.string().max(30).required(),
        email: Joi.string().email().required()
    });
    return schema.validate(contact);
}

module.exports = router;