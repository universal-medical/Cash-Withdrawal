var config = require('./../config.js');
var mongoose = require('mongoose');
var monogoUrl = config.mongoConfig.ip+':'+config.mongoConfig.port+'/'+config.mongoConfig.database;
mongoose.connect('mongodb://'+monogoUrl);

var dbSchema = require('./../models/db/dbSchema.js');

exports.addCardDetails = (cardnum, cardpin, balance)=>{
    return new Promise((resolve, reject)=>{
        var Cards = new dbSchema.Cards({"card_number": cardnum, "pin": cardpin,"balance": balance});
        Cards.save((err, obj) => {
            if(err){
                var o = {"code": "DB_ERROR", "msg": "Some Error Occurred"};
                reject(o);
            } else {
                if(obj && obj['_id']){
                    resolve(obj);
                } else {
                    var o = {"code": "DB_ERROR", "msg": "Some Error Occurred"};
                    reject(o);
                }
            }
        });
    });
};

exports.addCurrencyDetails = (currency, count)=>{
    return new Promise((resolve, reject)=>{
        var Atm = new dbSchema.Atm({"currency_denomination": currency, "count": count});
        Atm.save((err, obj) => {
            if(err){
                var o = {"code": "DB_ERROR", "msg": "Some Error Occurred"};
                reject(o);
            } else {
                if(obj && obj['_id']){
                    resolve(obj);
                } else {
                    var o = {"code": "DB_ERROR", "msg": "Some Error Occurred"};
                    reject(o);
                }
            }
        });
    });
};

exports.getAllTransactions = ()=>{
    return new Promise((resolve, reject)=>{
        var Transactions = dbSchema.Transactions;
        Transactions.find({}, (err, arr) => {
            if(err){
                var o = {"code": "DB_ERROR", "msg": "Some Error Occurred"};
                reject(o);
            } else {
                if(arr && arr.length > 0){
                    resolve(arr);
                } else {
                    var o = {"code": "EMPTY_DATA", "msg": "No transaction records founds"};
                    reject(o);
                }
            }
        });
    });
};

exports.isATMRunningOutOfStock = ()=>{
    return new Promise((resolve, reject)=>{
        var Atm = dbSchema.Atm;
        Atm.find({}, (err, arr) => {
            if(err){
                var o = {"code": "DB_ERROR", "msg": "Some Error Occurred"};
                reject(o);
            } else {
                if(arr && arr.length > 0){
                    var balance = 0;
                    for(var i=0; i<arr.length; i++){
                        var o = arr[i];
                        balance += (o.currency_denomination * o.count);
                    }
                    
                    if(balance > 0){
                        resolve('no');
                    } else {
                        resolve('yes');
                    }
                } else {
                    var o = {"code": "UNN_ERR", "msg": "Some Error Occurred"};
                    reject(o);
                }
            }
        });
    });
};

exports.checkCardDetails = (cardnum, cardpin)=>{
    return new Promise((resolve, reject)=>{
        var param = {"card_number": cardnum, "pin": cardpin};
        var Cards = dbSchema.Cards;
        Cards.findOne(param, (err, obj) => {
            if(err){
                var o = {"code": "DB_ERROR", "msg": "Some Error Occurred"};
                reject(o);
            } else {
                if(obj && obj['_id']){
                    var obj1 = {};
                    obj1['id'] = obj['_id'];
                    obj1['balance'] = obj['balance'];
                    resolve(obj1);
                } else {
                    var o = {"code": "INVALID_INPUT", "msg": "Invalid credentials"};
                    reject(o);
                }
            }
        });
    });
};

exports.checkSufficientFundsInAcc = (card_id, withdrawalAmt)=>{
    return new Promise((resolve, reject)=>{
        var param = {"_id": card_id};
        var Cards = dbSchema.Cards;
        Cards.findOne(param, (err, obj) => {
            if(err){
                var o = {"code": "DB_ERROR", "msg": "Some Error Occurred"};
                reject(o);
            } else {
                if(obj && obj['_id']){
                    if(obj['balance'] >= withdrawalAmt){
                        resolve(obj);
                    } else {
                        var o = {"code": "INVALID_INPUT", "msg": "Insufficient funds"};
                        reject(o);
                    }
                } else {
                    var o = {"code": "DB_ERROR", "msg": "Some Error Occurred"};
                    reject(o);
                }
            }
        });
    });
};

exports.checkATMBalance = (withdrawalAmt)=>{
    return new Promise((resolve, reject)=>{
        var param = {};
        var Atm = dbSchema.Atm;
        Atm.find(param, (err, arr) => {
            if(err){
                var o = {"code": "DB_ERROR", "msg": "Some Error Occurred"};
                reject(o);
            } else {
                if(arr && arr.length > 0){
                    var balance = 0;
                    for(var i=0; i<arr.length; i++){
                        var o = arr[i];
                        balance += (o.currency_denomination * o.count);
                    }
                    
                    if(balance >= withdrawalAmt){
                        resolve(arr);
                    } else {
                        var o = {"code": "INVALID_INPUT", "msg": "Insufficient funds in ATM"};
                        reject(o);
                    }
                } else {
                    var o = {"code": "UNN_ERR", "msg": "Some Error Occurred"};
                    reject(o);
                }
            }
        });
    });
};

exports.getWithdrawlNotes = (withdrawalAmt, notes) => {
    return new Promise((resolve, reject)=>{
        try{
            var noteObj = {};
            var withdrawalNotes = {};

            notes.sort((a, b) => {
                return a.currency_denomination - b.currency_denomination;
            });
            notes.reverse();

            for (var i = 0; i < notes.length; i++) {
                var note = notes[i]['currency_denomination'];
                var cnt = notes[i]['count'];
                noteObj[note] = cnt;
                withdrawalNotes[note] = 0;
            }
	    
            var noteCnts = {};
            for (var i = 0; i < notes.length; i++) {
                let o = notes[i];
                let note = parseInt(o['currency_denomination']);
                let noteCnt = (Math.floor(withdrawalAmt / note));
                if (noteCnt > noteObj[note]) {
                    noteCnt = noteObj[note];
                }
                noteCnts[note] = noteCnt;

                withdrawalAmt -= (noteCnt * note);
            }

            if(withdrawalAmt > 0){
                var msg = "Please enter the multiples of ";
                for(var i=0; i<notes.length; i++){
                    if(notes[i].count > 0){
                        msg += notes[i].currency_denomination + ",";
                    }
                }
                msg = msg.replace(/,$/, '');
                reject({"code":"INVALID_INPUT", "msg":msg});
            } else {
                var noteCnt = {"newData": noteCnts, "oldData": noteObj};
                resolve(noteCnt);
            }
        }catch(e){
            reject({"code": "UNN_ERR", "msg": "Some Error Occurred"});
        }
    });
}

exports.deductAmtFromATM = (noteCnt) => {
    return new Promise((resolve, reject)=>{
        var p = [];
        for(let i in noteCnt.newData){
            var oldVal = noteCnt.oldData[i];
            var newVal = noteCnt.newData[i];
            var updateVal = oldVal - newVal;
            
            var Atm = dbSchema.Atm;
            p.push(Atm.findOneAndUpdate({"currency_denomination": i}, {"count":updateVal},{"returnNewDocument":true}).exec());
        }
        
        Promise.all(p)
            .then(data => {
                resolve(noteCnt.newData);
            })
            .catch(err => {
                var o = {"code": "DB_ERROR", "msg": "Some Error Occurred"};
                reject(o);
            });
    });
}

let updateTransactions = (cardid, card_num, reqBalance)=>{
    return new Promise((resolve, reject)=>{
        var param = {"card_id": cardid, "card_num": card_num, "amount": reqBalance, "time": (new Date().getTime())};
        var Transactions = new dbSchema.Transactions(param);
        Transactions.save((err, obj) => {
            if(err){
                var o = {"code": "DB_ERROR", "msg": "Some Error Occurred"};
                reject(o);
            } else {
                resolve(obj);
            }            
        });
    });
}

exports.deductAmtFromCard = (cardid, card_balance, reqBalance, notes)=>{
    return new Promise((resolve, reject)=>{
        var remianBal = card_balance - reqBalance;
        var Cards = dbSchema.Cards;
        Cards.findOneAndUpdate({"_id": cardid}, {"balance":remianBal}, (err, obj) => {
            if(err){
                var o = {"code": "DB_ERROR", "msg": "Some Error Occurred"};
                reject(o);
            } else {
                updateTransactions(cardid, obj['card_number'], reqBalance)
                    .then(data => {
                        var returnData = {"balance": remianBal, "notes":notes};
                        resolve(returnData);
                    })
                    .catch(err => {
                        var o = {"code": "DB_ERROR", "msg": "Some Error Occurred"};
                        reject(o);
                    });
            }            
        });
    });
}