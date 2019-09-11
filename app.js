function init() {
 document.querySelector('.add__btn').addEventListener('click', onBtnClick);
    
    
}

function onBtnClick() {
    var itemDescription = document.querySelector('.add__description').value;
    // console.log(itemDescription);
    var itemValue = document.querySelector('.add__value').value;
    // console.log(itemValue);
    var itemType = document.querySelector('.add__type').value;
    // console.log(itemType);
    
        var list = document.createElement('ul');
        var listItemDescription = document.createElement('li');
        var listItemValue = document.createElement('li');
        
        var description = document.createTextNode(itemDescription);
        var value = document.createTextNode(itemValue);
        
        list.appendChild(listItemDescription);
        list.appendChild(listItemValue);
        
        listItemValue.appendChild(value);
        listItemDescription.appendChild(description);
    
    if (itemType == 'inc') {
        
        var incomeList = document.querySelector('.income__list');
        
        incomeList.appendChild(list);
        
    } else {
        
        var expenseList = document.querySelector('.expenses__list');
        
        expenseList.appendChild(list);
    }
}

init();