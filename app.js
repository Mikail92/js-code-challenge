
function init() {
    document.querySelector('.add__btn').addEventListener('click', addItems);
    
    // Set Month to current Month
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var d = new Date();
    var i = d.getMonth(); 
    document.querySelector('.budget__title--month').textContent = months[i]; 
    
    // Set Income && Expenses && percentage to 0
    document.querySelector('.budget__income--value').textContent = '0';
    document.querySelector('.budget__expenses--value').textContent = '0';
    document.querySelector('.budget__expenses--percentage').textContent = '0';
    
    // Set Budget to 0
    document.querySelector('.budget__value').textContent = '0'; 
    
}

function addItems() {
    
    var itemDescription = document.querySelector('.add__description').value;
    // console.log(itemDescription);
    var itemValue = document.querySelector('.add__value').value;
    // console.log(itemValue);
    var itemType = document.querySelector('.add__type').value;
    // console.log(itemType);
    
    if (itemDescription == '' || itemValue == '') {
        alert('Please add a description and value!');
        return;
    }
    
        var list = document.createElement('ul');
        var listItemDescription = document.createElement('li');
        var listItemValue = document.createElement('li');
        
        var description = document.createTextNode(itemDescription);
        var value = document.createTextNode(itemValue);
        
        list.appendChild(listItemDescription);
        list.appendChild(listItemValue);
        
        listItemValue.appendChild(value);
        listItemDescription.appendChild(description);
    
        var incomeOldValue = document.querySelector('.budget__income--value').textContent;
        var expensesOldValue = document.querySelector('.budget__expenses--value').textContent;
        var budgetOldValue =  document.querySelector('.budget__value').textContent;
      //var percentageCurrentValue = document.querySelector('.budget__expenses--percentage').textContent;
    
    if (itemType == 'inc') {
        
        var incomeList = document.querySelector('.income__list');
        // Income Value
        document.querySelector('.budget__income--value').textContent = parseFloat(incomeOldValue) + parseFloat(itemValue);
        // Budget Value
        document.querySelector('.budget__value').textContent = parseFloat(budgetOldValue) + parseFloat(itemValue);
        incomeList.appendChild(list);
        
    } else {
        
        var expenseList = document.querySelector('.expenses__list');
        // Expenses Value
        document.querySelector('.budget__expenses--value').textContent = parseFloat(expensesOldValue) + parseFloat(itemValue);
        // Budget Value - Expenses
        document.querySelector('.budget__value').textContent = parseFloat(budgetOldValue) - parseFloat(itemValue);
        // Calculate Percentage
        var percentage = Math.floor((parseFloat(expensesOldValue) + parseFloat(itemValue)) / incomeOldValue * 100);
        document.querySelector('.budget__expenses--percentage').textContent = percentage + '%';
        
        expenseList.appendChild(list);
    }
    
    
}

init();