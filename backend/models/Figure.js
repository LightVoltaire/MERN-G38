const mongoose = require('mongoose');

const FigureSchema = new mongoose.Schema({
	name: { type: String, required: true },
	manufacturer: { type: String, required: true },
	price: { type: Number, required: true },
	category: { type: String, required: true },
	imageUrl: { type: String, required: true },
	stock: { type: Number, default: 1 },
	userId: { type: String}
}, { collection: 'figurines' });

module.exports = mongoose.model('Figure', FigureSchema);
