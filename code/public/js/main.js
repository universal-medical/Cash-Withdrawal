
function refreshGlobalData(){
    this.card_id = "";
    this.card_balance = "";
    this.card_curr_balance = "";
    this.notes = [];
}

var G_Data = {};

$(()=>{
    loadPageData();
});

function loadPageData(){
    G_Data = new refreshGlobalData();
    bindDomElements();
    checkATMBalance();
}

function openTransaction(){
    var url = window.location;
    url = (url[url.length-1] === '/') ? 'viewTransactions' : '/viewTransactions';
    window.open(url);
}

function showLoader(){
    $(".form-messages").hide().html('');
    $(".form-btns").hide();
    $(".form-images").show();
}

function showMessages(msg, type){
    $(".form-messages").show().html(msg);
    $(".form-images").hide();
    $(".form-btns").hide();
    
    if(type === 'success'){
        $(".form-messages").css('color', 'green');
    } else {
        $(".form-messages").css('color', 'red');
    }
    setTimeout(showButtons, 3000);
}

function showButtons(){
    $(".form-messages").hide().html('');
    $(".form-images").hide();
    $(".form-btns").show();
}

function checkATMBalance(){
    try{
        var url = 'isATMRunningOutOfStock';
        var type = 'GET';
        var data = {};
        ajaxCall(url, type, data).then((res)=>{
            if(res.status === "error"){
                renderPage('cardFormPage');
                return;
            }
            
            var result = res.result;
            if(result === 'yes'){
                renderPage('noCashPage');
            } else {
                renderPage('cardFormPage');
            }
        });
    }catch(e){
        console.log("Method: checkATMBalance, Error:"+e.message);
        renderPage('cardFormPage');
    }
}

function submitCardForm(){
    try{
        showLoader();
        var cardnum = parseInt($.trim($("#cardnum").val()));
        var cardpin = parseInt($.trim($("#cardpin").val()));
        
        if(!cardnum || !validations('cardnum', cardnum)){
            showMessages('Please enter correct 16 digit card number');
            return;
        }
        
        if(!cardpin || !validations('cardpin', cardpin)){
            showMessages('Please enter correct 4 digit card pin number');
            return;
        }
        
        var url = 'checkCardDetails';
        var type = 'POST';
        var data = {"cardnum": cardnum, "cardpin": cardpin};
        ajaxCall(url, type, data).then((res)=>{
            if(res.status === "error"){
                showMessages(res.result);
                return;
            }
            
            var result = res.result;
            if(parseInt(result.balance) < 100){
                showMessages('Sorry you don\'t have sufficient balance <br> Your current balance: '+result.balance);
                return;
            }
            
            G_Data.card_id = result.id;
            G_Data.card_balance = result.balance;
            renderPage('enterAmtPage');
        });
    } catch(e) {
        console.log("Method: submitCardForm, Error:"+e.message);
    }
}

function submitWithdrawalAmount(){
    try{
        showLoader();
        var amount = $.trim($("#amount").val());
        
        if(!amount || !validations('amount', amount)){
            showMessages('Please enter valid amount');
            return;
        }
        
        if((amount % 100) !== 0){
            showMessages('Please enter valid amount');
            return;
        }
        
        if(amount > G_Data.card_balance){
            showMessages('Sorry you don\'t have sufficient balance <br> Your current balance: '+G_Data.card_balance);
            return;
        }
        
        var url = 'withdrawCash';
        var type = 'POST';
        var data = {"amount": amount, "cardid": G_Data.card_id};
        ajaxCall(url, type, data).then((res)=>{
            if(res.status === "error"){
                showMessages(res.result);
                return;
            }
            
            G_Data.card_curr_balance = res.result.balance;
            G_Data.notes = res.result.notes;
            renderPage('resultPage');
        });
    } catch(e) {
        console.log("Method: submitWithdrawalAmount, Error:"+e.message);
    }
}

function renderTransactionResult(){
    try{
        var balance = G_Data.card_curr_balance;
        var notes = G_Data.notes;
        var noteStr = "";
        
        $.each(notes, (k, v)=>{
            if(v > 0){
                noteStr += '<span>'+ k +' : '+ v +'</span><br>';   
            }
        });
        
        $("#balance").html(balance);
        $("#notes").html(noteStr);
    } catch(e) {
        console.log("Method: renderTransactionResult, Error:"+e.message);
    }
}