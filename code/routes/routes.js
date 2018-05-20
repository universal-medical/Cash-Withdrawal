var express = require('express');
var router = express.Router();
var repository = require('./repository.js');

router.get('/', (req, res) => {
    res.render(__dirname+'/../views/index.html');
});

router.get('/admin', (req, res) => {
    res.render(__dirname+'/../views/admin.html');
});

router.get('/viewTransactions', (req, res) => {
    repository.getAllTransactions()
        .then(data => {
            var str = '<table><tr><th>Card number</th><th>Amount</th><th>Time</th></tr>';
            for(let i=0; i< data.length; i++){
                str += '<tr><td>'+data[i].card_num+'</td><td>'+data[i].amount+'</td><td>'+(new Date(data[i].time))+'</td></tr>';
            }
            str += '</table>';
            res.send(str);
        })
        .catch(err => {
            if(err.code === "EMPTY_DATA"){
                res.send(err.msg);
            }
            res.status(500);
            res.send({"status": "error", "result": err.msg});
        });
});

router.get('/isATMRunningOutOfStock', (req, res) => {
    repository.isATMRunningOutOfStock()
        .then(data => {
            res.send({"status": "success", "result": data});
        })
        .catch(err => {
            res.status(500);
            res.send({"status": "error", "result": err.msg});
        });
});

router.post('/addCardDetails', (req, res) => {
    var cardnum = req.body.cardnum;
    var cardpin = req.body.cardpin;
    var balance = req.body.balance;
    
    repository.addCardDetails(cardnum, cardpin, balance)
        .then(data => {
            res.send({"status": "success", "result": data})
        })
        .catch(err => {
            if(err.code === "INVALID_INPUT"){
                res.status(400);
                res.send({"status": "error", "result": err.msg});
            } else {
                res.status(500);
                res.send({"status": "error", "result": err.msg});
            }
        });
});

router.post('/addCurrencyDetails', (req, res) => {
    var currency = req.body.currency;
    var count = req.body.count;
    
    repository.addCurrencyDetails(currency, count)
        .then(data => {
            res.send({"status": "success", "result": data})
        })
        .catch(err => {
            if(err.code === "INVALID_INPUT"){
                res.status(400);
                res.send({"status": "error", "result": err.msg});
            } else {
                res.status(500);
                res.send({"status": "error", "result": err.msg});
            }
        });
});

router.post('/checkCardDetails', (req, res) => {
    var cardnum = req.body.cardnum;
    var cardpin = req.body.cardpin;
    
    repository.checkCardDetails(cardnum, cardpin)
        .then(data => {
            res.send({"status": "success", "result": data})
        })
        .catch(err => {
            if(err.code === "INVALID_INPUT"){
                res.status(400);
                res.send({"status": "error", "result": err.msg});
            } else {
                res.status(500);
                res.send({"status": "error", "result": err.msg});
            }
        });
});

router.post('/withdrawCash', (req, res) => {
    var cardid = req.body.cardid;
    var reqBalance = parseInt(req.body.amount);
    var card_balance = 0;
    
    repository.checkSufficientFundsInAcc(cardid, reqBalance)
        .then(data => {
            card_balance = data['balance'];
            return repository.checkATMBalance(reqBalance)
        })
        .then(data => repository.getWithdrawlNotes(reqBalance, data))
        .then(data => repository.deductAmtFromATM(data))
        .then(data => repository.deductAmtFromCard(cardid, card_balance, reqBalance, data))
        .then(data => {
            res.send({"status": "success", "result": data})
        })
        .catch(err => {
            if(err.code === "INVALID_INPUT"){
                res.status(400);
                res.send({"status": "error", "result": err.msg});
            } else {
                res.status(500);
                res.send({"status": "error", "result": err.msg});
            }
        });
});

module.exports = router;