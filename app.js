
var budgetController = (function() {
    
    // assign initial values for the Expense object (constructor)
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1; // the percentage of a specific expense, in regards to the total income
    };

    var getPercentageVal = function(partVal, entireVal) {
        return Math.round((partVal / entireVal) * 100);
    }

    // calculate the percentage of a specific expense value
    // taking into account the total income value
    Expense.prototype.calcPercentage = function(totalIncome) {
        (totalIncome > 0) ? (this.percentage = getPercentageVal(this.value, totalIncome)) : (this.percentage = -1);
    };
    
    // getter method for the percentage field
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    // assign initial values for the Income object (constructor)
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    

    // calculate the total of either the expenses or the incomes
    // based on the type argument ('exp' for expenses, 'inc' for incomes)    
    var calculateTotal = function(type) {
        var sum = 0;
        for (i = 0; i < data.allItems[type].length; i++) {
            sum += data.allItems[type][i].value;
        }
        data.totals[type] = sum;
    };
    
    // this is the data object storing the information
    var data = {
        allItems: {
            exp: [], // array of expenses
            inc: []  // array of incomes
        },
        totals: {
            exp: 0, // the total of all expenses
            inc: 0 // the total of all incomes
        },
        budget: 0, // the budget
        percentage: -1 // the global percentage of total_expenses / total_income
    };
    
    
    // public functions accessible from outside of this module
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            var all = data.allItems[type];
            
            // Create new ID based on the ID of the latest element + 1
            if (all.length > 0) {
                ID = all[all.length - 1].id + 1;
            } else {
                // if the item is new, the ID is zero
                ID = 0;
            }
            
            // Create new item based on 'inc' or 'exp' type
            // the constructor of each object (Expense or Income) is called
            // based on the 'type' argument
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
        },
        
        // deletes an item, based on the type (expense or income)
        // and the ID of the element that needs to be removed
        deleteItem: function(type, id) {
            var ids, index;
            var all = data.allItems[type];
            
            for (i = 0; i < all.length; i++) {
                ids.push(all[i].id);
            }

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        //calculate the amount left to be used after substracting the expenses
        calculateBudget: function() {  
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            var totalInc = data.totals.inc;
            var totalExp = data.totals.exp; 
            
            // Calculate the budget: income - expenses
            data.budget = totalInc - totalExp;
            
            // calculate the percentage of income that we spent
            // check if total income is not zero, otherwise we get a division by zero error
            if (totalInc > 0) {
                data.percentage = getPercentageVal(totalExp, totalInc);
            } else {
                data.percentage = -1;
            }
        },
        
        // this method calculates and fills in the percentage field 
        // of each expense object
        calculatePercentages: function() {
            var allExpenses = data.allItems.exp;
            for (i = 0; i < allExpenses.length; i++) {
               allExpenses[i].calcPercentage(data.totals.inc); 
            }
        },
        
        // returns an array of all percentages for all expenses
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        
        // returns an object containing the calculated data above
        // the budget, the total income, total expense, and global percentage
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        // just a method to print out the object data (for testing)
        testing: function() {
            console.log(data);
        }
    };
    
})();



var UIController = (function() {
    
    // identifiers in the DOM for the UI elements that we need
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    
    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */

        num = Math.abs(num); // takes the absolute value (positive value)
        num = num.toFixed(2);  // and use 2 decimals

        numSplit = num.split('.'); // create an array with 2 elements (the integer part, before "." and the decimal part, after ".")

        int = numSplit[0]; // the integer part - the first element in the array
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //use comma before the last 3 digits in the integer part
        }

        dec = numSplit[1]; // the decimal part

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec; // if it's an expense, use "-", otherwise use "+"

    };
    
    // a general function that loops through all elements
    // and calls a specific function for each element (callback)
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    
    //these are the public functions that are called outside of this "class"
    return {

        // get the values from the input
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value, // take the description from the input
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) // take the value from the input (make it a float value)
            };
        },
        
        // add either new expense, or income to the HTML DOM
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        
        // delete a specified list item, identified by the selectorID
        deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID); // we get the element
            el.parentNode.removeChild(el); // go up one level and remove the child element
            
        },
        
        // clear all fields (after adding an expense or income)
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);

            for (i = 0; i < fieldsArr.length; i++) {
                fieldsArr[i].value = "";
            }
            
            fieldsArr[0].focus();
        },
        
        // display the total income and expenses at the top of the page
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },
        
        // display the percentages of each expense
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            //loop through each expense and display it near it, if greater than zero
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        // display the current month in letters
        displayMonth: function() {
            var now, months, month, year;
            
            now = new Date(); // the current date
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; // array of all months
            month = now.getMonth(); // the current month
            
            year = now.getFullYear(); // the current year
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year; // display it
        },
        
        // change the color of the submit button depending on the type (expense or income)
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },
        
        
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
    
})();




// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    // define the functions that are called for each event
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings(); // an array of all identifiers in the DOM that we need
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem); // what happens when the add button is clicked (add item)

        // the same thing (add item) happens if ENTER is pressed
        document.addEventListener('keypress', function(event) { 
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        // what happens when the delete button is clicked
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        // what happens when the type dropdown is changed (+ or -, income or expense)
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);        
    };
    
    
    // display the total amount left (incomes - expenses)
    // and display it
    var updateBudget = function() {
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    
    
    // update all percentages in the UI
    var updatePercentages = function() {
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get the field input data
        input = UICtrl.getInput();        
        
        // check if the description is not empty and the value is a positive number
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();
            
            // 6. Calculate and update percentages
            updatePercentages();
        }
    };
    
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        //navigate up in the tree to the item element and then get its ID
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            //the ID is of this format "inc-1" and we need to take the number ("1") and the type ("inc")
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update and show the new budget
            updateBudget();
            
            // 4. Calculate and update percentages
            updatePercentages();
        }
    };
    
    
    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);

//fire up the app (the init method)
controller.init();