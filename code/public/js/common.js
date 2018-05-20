function bindDomElements(){
    try{
        $("#cardnum, #cardpin").on('keypress', ()=>{
            if(event.keyCode === 13){
                submitCardForm();
            }
        });
        
        $("#amount").on('keypress', ()=>{
            if(event.keyCode === 13){
                submitWithdrawalAmount();
            }
        });
    } catch(e) {
        
    }
}

function renderPage(id){
    
    $(".hideall").hide();
    $("#"+id).show();
    
    showButtons();
    $("input").val('');
    
    switch(id){
        case "cardFormPage":
            $("#cardnum").focus();
            break;
        case "enterAmtPage":
            $("#amount").focus();
            break;
        case "resultPage":
            renderTransactionResult();
            break;
    }
}

function goHomePage(){
    loadPageData();
}

function ajaxCall(url, method, data){
    return new Promise((resolve, reject)=>{
        $.ajax({
            url: url,
            type: method,
            data: data,
            success: function(res){
                if(!res){
                    res = {"status": "error", "result": "some error occurred"};
                }
                
                resolve(res);
            },
            error: function(err){
                var msg = (err.responseJSON && err.responseJSON.result) ? err.responseJSON.result : err.responseText;
                resolve({"status": "error", "result": msg});
            }
        });
    });
}

function validations(type, val){
    var pattern = "";
    switch(type){
        case "cardnum":
            pattern = /^[0-9]{16}$/;
            break;
            
        case "cardpin":
            pattern = /^[0-9]{4}$/;
            break;
            
        case "amount":
            pattern = /^[0-9]{3,}$/;
            break;
    }
    
    return pattern.test(val);
}