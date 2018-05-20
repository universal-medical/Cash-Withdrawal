
let mongoose = require('mongoose');

let cardSchema = mongoose.Schema({
    card_number:{
        type: Number,
        required: true
    },
    pin:{
        type: Number,
        required: true
    },
    balance:{
        type: Number,
        required: true
    }
});

let atmSchema = mongoose.Schema({
    currency_denomination:{
        type: Number,
        required: true
    },
    count:{
        type: Number,
        required: true
    }
});

let transactionSchema = mongoose.Schema({
    card_id:{
        type: String,
        required: true
    },
    card_num:{
        type: Number,
        required: true
    },
    amount:{
        type: Number,
        required: true
    },
    time:{
        type: Number,
        required: true
    }
});

module.exports.Cards = mongoose.model('Cards', cardSchema);
module.exports.Atm = mongoose.model('Atm', atmSchema);
module.exports.Transactions = mongoose.model('Transactions', transactionSchema);